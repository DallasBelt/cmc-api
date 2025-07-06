import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from 'src/auth/entities/user.entity';
import { AssistantInfo } from './entities/assistant-info.entity';
import { AssignAssistantsDto } from './dto/assign-assistants.dto';
import { ValidRoles } from 'src/auth/enums';
import { UserStatus } from 'src/auth/enums';
import { ResponseType } from 'src/common/enums/response-type.enum';
import { Response } from 'src/common/interfaces/response.interface';

@Injectable()
export class AssistantInfoService {
  private readonly logger = new Logger('AssistantInfoService');

  constructor(
    @InjectRepository(AssistantInfo)
    private readonly assistantInfoRepository: Repository<AssistantInfo>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async updateAssistants(dto: AssignAssistantsDto): Promise<Response> {
    const { medicId, assistantIds } = dto;

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

    // If no assistant is selected and there are no assignments to remove
    if (!assistantIds.length && !currentAssignments.length) {
      return { message: 'Debe seleccionar al menos un asistente.', type: ResponseType.Warning };
    }

    // Validate if the sent assistantIds are exactly the same as current
    if (assistantIds.length === currentAssistantIds.length) {
      const isSameSet = assistantIds.every((id) => currentAssistantIds.includes(id));

      if (isSameSet) {
        return { message: 'No se detectaron cambios.', type: ResponseType.Info };
      }
    }

    // If assistantIds is empty, handle removal
    if (assistantIds.length === 0) {
      await this.assistantInfoRepository.remove(currentAssignments);
      return { message: 'Asistentes eliminados exitosamente.', type: ResponseType.Success };
    }

    // Otherwise, synchronize additions and removals as before
    const toRemove = currentAssignments.filter((a) => !assistantIds.includes(a.user.id));
    const toAddIds = assistantIds.filter((id) => !currentAssistantIds.includes(id));

    // Remove outdated assignments from database
    if (toRemove.length > 0) {
      await this.assistantInfoRepository.remove(toRemove);
      // Also update the state of removed assistants to Inactive
      for (const assignment of toRemove) {
        const assistantUser = assignment.user;
        assistantUser.status = UserStatus.Pending;
        await this.userRepository.save(assistantUser);
      }
    }

    // Add new assignments for valid assistant users
    for (const assistantId of toAddIds) {
      const user = await this.userRepository.findOne({ where: { id: assistantId } });

      // Skip if user doesn't exist or is not assistant role
      if (!user || user.role !== 'assistant') {
        continue;
      }

      // Create new assignment and save it
      const newAssignment = this.assistantInfoRepository.create({ user, medic });
      await this.assistantInfoRepository.save(newAssignment);

      // Update assistant status to ACTIVE when assigned to a medic
      if (user.status !== UserStatus.Active) {
        user.status = UserStatus.Active;
        await this.userRepository.save(user);
      }
    }
    return { message: 'Asistentes actualizados exitosamente.', type: ResponseType.Success };
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

    return assistants;
  }

  // Find all available assistants not assigned to any medic
  async findAvailableAssistants(): Promise<User[]> {
    return this.userRepository
      .createQueryBuilder('user')
      .leftJoin('assistant_info', 'info', 'info.user_id = user.id')
      .leftJoinAndSelect('user.userInfo', 'userInfo')
      .where('user.role = :role', { role: 'assistant' })
      .andWhere('info.user_id IS NULL')
      .orderBy('userInfo.lastName', 'ASC')
      .addOrderBy('userInfo.firstName', 'ASC')
      .getMany();
  }
}
