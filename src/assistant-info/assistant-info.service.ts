import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from 'src/auth/entities/user.entity';
import { AssistantInfo } from './entities/assistant-info.entity';

import { AssignAssistantsDto } from './dto/assign-assistants.dto';

import { ValidRoles } from 'src/auth/enums';

@Injectable()
export class AssistantInfoService {
  private readonly logger = new Logger('AssistantInfoService');

  constructor(
    @InjectRepository(AssistantInfo)
    private readonly assistantInfoRepository: Repository<AssistantInfo>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async updateAssistants(dto: AssignAssistantsDto): Promise<{ message: string }> {
    const { medicId, assistantIds } = dto;
    this.logger.log(
      `Updating assistants for medic ${medicId}, assistantIds: [${assistantIds.join(', ')}]`,
    );

    // Find the medic user and validate role
    const medic = await this.userRepository.findOne({ where: { id: medicId } });
    if (!medic || medic.role !== 'medic') {
      throw new NotFoundException('El médico no existe o no es válido.');
    }

    // Fetch current assignments for this medic
    const currentAssignments = await this.assistantInfoRepository.find({
      where: { medic: { id: medicId } },
      relations: ['user'],
    });

    // Extract current assistant IDs
    const currentAssistantIds = currentAssignments.map((a) => a.user.id);

    // Validate if the sent assistantIds are exactly the same as current
    // First, compare lengths
    if (assistantIds.length === currentAssistantIds.length) {
      // Then check if every ID in assistantIds is included in currentAssistantIds (order doesn’t matter)
      const isSameSet = assistantIds.every((id) => currentAssistantIds.includes(id));

      if (isSameSet) {
        this.logger.log(`No changes detected for medic ${medicId}.`);
        return { message: 'No se detectaron cambios.' };
      }
    }

    // If assistantIds is empty, handle removal
    if (assistantIds.length === 0) {
      // Check if there are already no assignments
      if (currentAssignments.length === 0) {
        this.logger.warn(`No assignments to remove for medic ${medicId}`);
        throw new Error('No se asignaron asistentes.');
      }

      // If there are assignments, remove them all
      await this.assistantInfoRepository.remove(currentAssignments);
      this.logger.log(`Removed all assistants for medic ${medicId}`);
      return { message: 'Asistentes eliminados exitosamente.' };
    }

    // Otherwise, synchronize additions and removals as before
    const toRemove = currentAssignments.filter((a) => !assistantIds.includes(a.user.id));
    const toAddIds = assistantIds.filter((id) => !currentAssistantIds.includes(id));

    // Remove outdated assignments from database
    if (toRemove.length > 0) {
      this.logger.log(
        `Removing assistants [${toRemove.map((a) => a.user.id).join(', ')}] from medic ${medicId}`,
      );
      await this.assistantInfoRepository.remove(toRemove);
    }

    // Add new assignments for valid assistant users
    for (const assistantId of toAddIds) {
      this.logger.log(`Adding assistant ${assistantId} to medic ${medicId}`);
      const user = await this.userRepository.findOne({ where: { id: assistantId } });

      // Skip if user doesn't exist or is not assistant role
      if (!user || user.role !== 'assistant') {
        continue;
      }

      // Create new assignment and save it
      const newAssignment = this.assistantInfoRepository.create({ user, medic });
      await this.assistantInfoRepository.save(newAssignment);
    }
    this.logger.log(`Assistants for medic ${medicId} updated successfully.`);
    return { message: 'Asistentes actualizados exitosamente.' };
  }

  // Get all users with role 'assistant'
  async findAllAssistants(): Promise<User[]> {
    return await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.userInfo', 'userInfo')
      .where('user.role = :role', { role: ValidRoles.Assistant })
      .orderBy('userInfo.lastName', 'ASC')
      .addOrderBy('userInfo.firstName', 'ASC')
      .getMany();
  }

  // Find all assistants assigned to a medic
  async findAssistantsByMedic(medicId: string): Promise<AssistantInfo[]> {
    const medic = await this.userRepository.findOne({ where: { id: medicId } });
    if (!medic || medic.role !== 'medic') {
      throw new NotFoundException('El médico no existe o no es válido.');
    }

    const assistants = await this.assistantInfoRepository.find({
      where: { medic: { id: medicId } },
      relations: ['user'],
    });

    if (assistants.length === 0) {
      throw new NotFoundException('No hay asistentes asignados a este médico.');
    }

    return assistants;
  }
}
