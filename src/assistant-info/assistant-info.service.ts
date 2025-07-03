import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from 'src/auth/entities/user.entity';
import { AssistantInfo } from './entities/assistant-info.entity';

import { AssignAssistantDto } from './dto/assign-assistant.dto';

@Injectable()
export class AssistantInfoService {
  private readonly logger = new Logger('AssistantInfoService');

  constructor(
    @InjectRepository(AssistantInfo)
    private readonly assistantInfoRepository: Repository<AssistantInfo>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  // Assign or reassign assistant to medic
  async assignAssistant(dto: AssignAssistantDto): Promise<{ message: string }> {
    const { assistantId, medicId } = dto;

    // Find the assistant user by ID
    const user = await this.userRepository.findOne({ where: { id: assistantId } });
    if (!user || user.role !== 'assistant') {
      throw new NotFoundException('El usuario no es asistente o no existe.');
    }

    // Find the medic user by ID
    const medic = await this.userRepository.findOne({ where: { id: medicId } });
    if (!medic || medic.role !== 'medic') {
      throw new NotFoundException('El médico no existe o no es válido.');
    }

    // Check if there is an existing assignment for this assistant
    const existing = await this.assistantInfoRepository.findOne({
      where: { user: { id: assistantId } },
      relations: ['medic'],
    });

    if (existing) {
      // If assistant is already assigned to the same medic
      if (existing.medic.id === medic.id) {
        return { message: 'Este asistente ya está asignado a este médico.' };
      }

      // Update the existing assignment with the new medic
      const updated = await this.assistantInfoRepository.preload({
        id: existing.id,
        medic,
      });

      if (!updated) {
        throw new NotFoundException('No se encontró la asignación para actualizar.');
      }

      await this.assistantInfoRepository.save(updated);
      return { message: 'Asistente reasignado correctamente al nuevo médico.' };
    }

    // Create a new assignment if none exists
    const newAssignment = this.assistantInfoRepository.create({ user, medic });
    await this.assistantInfoRepository.save(newAssignment);

    return { message: 'Asistente asignado correctamente al médico.' };
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
