import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from 'src/auth/entities/user.entity';
import { MedicInfo } from 'src/medic-info/entities/medic-info.entity';
import { Schedule } from './entities/schedule.entity';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';

import { hasDuplicateShifts, hasOverlappingShifts, areShiftsEqual } from './utils/schedule-utils';

@Injectable()
export class ScheduleService {
  private readonly logger = new Logger('ScheduleService');

  constructor(
    @InjectRepository(Schedule)
    private readonly scheduleRepo: Repository<Schedule>,
    @InjectRepository(MedicInfo)
    private readonly medicInfoRepo: Repository<MedicInfo>,
  ) {}

  async create(dto: CreateScheduleDto, user: User) {
    try {
      const { shifts } = dto;

      const medicInfo = await this.medicInfoRepo.findOne({
        where: { user: { id: user.id } },
      });

      if (!medicInfo) {
        throw new BadRequestException('User must have a medic profile.');
      }

      // Validate shifts array
      if (hasDuplicateShifts(shifts)) {
        throw new BadRequestException('Duplicate shift(s) found.');
      }

      if (hasOverlappingShifts(shifts)) {
        throw new BadRequestException('Overlapping shift(s) found.');
      }

      const schedule = this.scheduleRepo.create({
        shifts: shifts.map((s) => ({
          checkIn: s.checkIn,
          checkOut: s.checkOut,
          days: s.days,
        })),
        medicInfo,
      });

      const saved = await this.scheduleRepo.save(schedule);

      return {
        message: 'Schedule successfully created.',
        schedule: saved,
      };
    } catch (error) {
      this.logger.error(error.message, error.stack);
      throw error instanceof BadRequestException ? error : new InternalServerErrorException();
    }
  }

  async findByParent(user: User): Promise<Schedule[]> {
    try {
      const medicInfo = await this.medicInfoRepo.findOne({
        where: { user: { id: user.id } },
      });

      if (medicInfo) {
        return await this.scheduleRepo.find({
          where: { medicInfo: { id: medicInfo.id } },
          relations: ['medicInfo'],
        });
      }

      return [];
    } catch (error) {
      this.logger.error('Failed to find schedules for user', error.stack);
      throw new InternalServerErrorException('Could not retrieve schedules.');
    }
  }

  async update(id: string, dto: UpdateScheduleDto, user: User) {
    try {
      const existing = await this.scheduleRepo.findOne({
        where: { id },
        relations: ['medicInfo'],
      });

      if (!existing) {
        throw new NotFoundException('Schedule not found.');
      }

      const medicInfo = await this.medicInfoRepo.findOne({
        where: { user: { id: user.id } },
      });

      const isOwner = medicInfo && existing.medicInfo?.id === medicInfo.id;

      if (!isOwner) {
        throw new BadRequestException("You can't update this schedule.");
      }

      const incomingShifts = dto.shifts;

      if (hasDuplicateShifts(incomingShifts)) {
        throw new BadRequestException('Duplicate shifts found.');
      }

      if (hasOverlappingShifts(incomingShifts)) {
        throw new BadRequestException('Overlapping shifts found.');
      }

      if (areShiftsEqual(existing.shifts, incomingShifts)) {
        return {
          message: 'No changes detected.',
          schedule: existing,
        };
      }

      await this.scheduleRepo.update(id, { shifts: incomingShifts });

      const updated = await this.scheduleRepo.findOneBy({ id });

      return {
        message: 'Schedule successfully updated.',
        schedule: updated,
      };
    } catch (error) {
      this.logger.error(error.message, error.stack);
      throw error instanceof BadRequestException || error instanceof NotFoundException
        ? error
        : new InternalServerErrorException();
    }
  }
}
