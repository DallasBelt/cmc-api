import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';

import { User } from 'src/auth/entities/user.entity';
import { MedicInfo } from 'src/medic-info/entities/medic-info.entity';
import { AssistantInfo } from 'src/assistant-info/entities/assistant-info.entity';
import { Schedule } from './entities/schedule.entity';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';

import {
  hasDuplicateShifts,
  isDuplicateShift,
  hasOverlappingShifts,
  isOverlappingShift,
} from './utils/schedule-utils';

@Injectable()
export class ScheduleService {
  private readonly logger = new Logger('ScheduleService');

  constructor(
    @InjectRepository(Schedule)
    private readonly scheduleRepo: Repository<Schedule>,
    @InjectRepository(MedicInfo)
    private readonly medicInfoRepo: Repository<MedicInfo>,
    @InjectRepository(AssistantInfo)
    private readonly assistantInfoRepo: Repository<AssistantInfo>,
  ) {}

  async create(dtos: CreateScheduleDto[], user: User) {
    try {
      // Verify that the user has a profile
      const medicInfo = await this.medicInfoRepo.findOne({
        where: { user: { id: user.id } },
      });

      const assistantInfo = await this.assistantInfoRepo.findOne({
        where: { user: { id: user.id } },
      });

      if (!medicInfo && !assistantInfo) {
        throw new BadRequestException(
          'User must have a profile to create a schedule.',
        );
      }

      const schedules: DeepPartial<Schedule>[] = [...dtos];

      // Verify duplicate shifts in the body
      if (hasDuplicateShifts(schedules)) {
        throw new BadRequestException('Duplicate shift(s) found.');
      }

      // Get existing schedule
      const existingSchedules = await this.scheduleRepo.find({
        where: medicInfo
          ? { medicInfo: { id: medicInfo.id } }
          : { assistantInfo: { id: assistantInfo.id } },
      });

      // Verify duplicate shifts in the database
      if (isDuplicateShift(schedules, existingSchedules)) {
        throw new BadRequestException('Shift(s) already exists.');
      }

      if (isOverlappingShift(schedules, existingSchedules)) {
        throw new BadRequestException('Shift(s) overlap with existing ones.');
      }

      if (hasOverlappingShifts(schedules)) {
        throw new BadRequestException('Overlapping shift(s) found.');
      }

      // Assign an id for each shift
      for (const schedule of schedules) {
        if (medicInfo) {
          schedule.medicInfo = medicInfo;
        } else if (assistantInfo) {
          schedule.assistantInfo = assistantInfo;
        }
      }

      // Create and save the schedule
      const createdSchedules = this.scheduleRepo.create(schedules);
      const savedSchedules = await this.scheduleRepo.save(createdSchedules);

      return {
        message: 'Schedule successfully created.',
        schedules: savedSchedules,
      };
    } catch (error) {
      // Log the error and throw a custom error message
      this.logger.error(error.message, error.stack);

      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw new InternalServerErrorException();
    }
  }

  async findByParent(
    user: User,
    medicId?: string,
    assistantId?: string,
  ): Promise<Schedule[]> {
    if (!medicId && !assistantId) {
      const medicInfo = await this.medicInfoRepo.findOne({
        where: { user: { id: user.id } },
      });
      const assistantInfo = await this.assistantInfoRepo.findOne({
        where: { user: { id: user.id } },
      });

      if (medicInfo) medicId = medicInfo.id;
      else if (assistantInfo) assistantId = assistantInfo.id;
    }

    if (medicId) {
      return this.scheduleRepo.find({
        where: { medicInfo: { id: medicId } },
        relations: ['medicInfo'],
      });
    }

    if (assistantId) {
      return this.scheduleRepo.find({
        where: { assistantInfo: { id: assistantId } },
        relations: ['assistantInfo'],
      });
    }

    return [];
  }

  async update(id: string, dto: UpdateScheduleDto, user: User) {
    try {
      const medicInfo = await this.medicInfoRepo.findOne({
        where: { user: { id: user.id } },
      });

      const assistantInfo = await this.assistantInfoRepo.findOne({
        where: { user: { id: user.id } },
      });

      if (!medicInfo && !assistantInfo) {
        throw new BadRequestException('User must have a profile.');
      }

      const existing = await this.scheduleRepo.findOne({
        where: { id },
        relations: ['medicInfo', 'assistantInfo'],
      });

      if (!existing) {
        throw new NotFoundException('Shift not found.');
      }

      // Asegurar que el turno le pertenezca al usuario
      const isOwner =
        (medicInfo && existing.medicInfo?.id === medicInfo.id) ||
        (assistantInfo && existing.assistantInfo?.id === assistantInfo.id);

      if (!isOwner) {
        throw new BadRequestException("You can't update this shift.");
      }

      // Verificar duplicados
      const siblingSchedules = await this.scheduleRepo.find({
        where: medicInfo
          ? { medicInfo: { id: medicInfo.id } }
          : { assistantInfo: { id: assistantInfo.id } },
      });

      const filtered = siblingSchedules.filter((s) => s.id !== id);
      if (isDuplicateShift([dto], filtered)) {
        throw new BadRequestException('This shift already exists.');
      }

      await this.scheduleRepo.update(id, dto);

      const updated = await this.scheduleRepo.findOneBy({ id });

      return {
        message: 'Schedule successfully updated.',
        schedule: updated,
      };
    } catch (error) {
      this.logger.error(error.message, error.stack);

      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw new InternalServerErrorException();
    }
  }

  async remove(id: string) {
    const existing = await this.scheduleRepo.findOneBy({ id });
    if (!existing) {
      throw new NotFoundException('The schedule does not exist.');
    }

    await this.scheduleRepo.remove(existing);

    return {
      message: 'Schedule successfully removed.',
      id: existing.id,
    };
  }
}
