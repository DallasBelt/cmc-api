import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from 'src/auth/entities/user.entity';
import { AssistantInfo } from './entities/assistant-info.entity';

import { AssignAssistantsDto } from './dto/assign-assistants.dto';

@Injectable()
export class AssistantInfoService {
  private readonly logger = new Logger('AssistantInfoService');

  constructor(
    @InjectRepository(AssistantInfo)
    private readonly assistantInfoRepository: Repository<AssistantInfo>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // Assign or reassign assistant(s) to medic
  async assignAssistants(dto: AssignAssistantsDto): Promise<{
    message: string;
    assigned: number;
    reassigned: number;
    skipped: number;
  }> {
    const { assistantIds, medicId } = dto;

    const medic = await this.userRepository.findOne({ where: { id: medicId } });
    if (!medic || medic.role !== 'medic') {
      throw new NotFoundException('El médico no existe o no es válido.');
    }

    let assigned = 0;
    let reassigned = 0;
    let skipped = 0;

    for (const assistantId of assistantIds) {
      const user = await this.userRepository.findOne({ where: { id: assistantId } });

      // Skip if assistant does not exist or is not of correct role
      if (!user || user.role !== 'assistant') {
        skipped++;
        continue;
      }

      const existing = await this.assistantInfoRepository.findOne({
        where: { user: { id: assistantId } },
        relations: ['medic'],
      });

      if (existing) {
        // If already assigned to the same medic, skip
        if (existing.medic.id === medic.id) {
          skipped++;
          continue;
        }

        // Reassign to a new medic
        const updated = await this.assistantInfoRepository.preload({
          id: existing.id,
          medic,
        });

        if (updated) {
          await this.assistantInfoRepository.save(updated);
          reassigned++;
        } else {
          skipped++;
        }
      } else {
        // Create new assignment
        const newAssignment = this.assistantInfoRepository.create({ user, medic });
        await this.assistantInfoRepository.save(newAssignment);
        assigned++;
      }
    }

    return {
      message: 'Asignaciones procesadas correctamente.',
      assigned,
      reassigned,
      skipped,
    };
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

  // Remove assistant assignment by assistant user ID
  async removeAssignment(userId: string): Promise<{ message: string }> {
    const existing = await this.assistantInfoRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!existing) {
      throw new NotFoundException('Este asistente no tiene una asignación.');
    }

    await this.assistantInfoRepository.remove(existing);

    return { message: 'Asignación del asistente eliminada correctamente.' };
  }
}
