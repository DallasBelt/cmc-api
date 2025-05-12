import {
  BadRequestException,
  Injectable,
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
  hasDuplicateSchedules,
  hasOverlappingSchedules,
  isDuplicateSchedule,
  isOverlappingSchedule,
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

  async create(dto: CreateScheduleDto, user: User) {
    const schedules: DeepPartial<Schedule>[] = [dto];
    await this.assignOwner(schedules, user);
    await this.validateConflicts(user, [dto]);

    const schedule = this.scheduleRepo.create(schedules[0]);
    const saved = await this.scheduleRepo.save(schedule);

    return {
      message: 'Schedule successfully created.',
      schedule: saved,
    };
  }

  async createMany(dtos: CreateScheduleDto[], user: User) {
    const partials: DeepPartial<Schedule>[] = [...dtos];
    await this.assignOwner(partials, user);
    await this.validateConflicts(user, dtos);

    const schedules = this.scheduleRepo.create(partials);
    const saved = await this.scheduleRepo.save(schedules);

    return {
      message: 'Schedules successfully created.',
      schedules: saved,
    };
  }

  private async assignOwner(dtos: DeepPartial<Schedule>[], user: User) {
    const medicInfo = await this.medicInfoRepo.findOne({
      where: { user: { id: user.id } },
    });

    const assistantInfo = await this.assistantInfoRepo.findOne({
      where: { user: { id: user.id } },
    });

    if (!medicInfo && !assistantInfo) {
      throw new BadRequestException('User must create a profile first.');
    }

    for (const dto of dtos) {
      if (medicInfo) dto.medicInfo = medicInfo;
      else if (assistantInfo) dto.assistantInfo = assistantInfo;
    }
  }

  private async validateConflicts(
    user: User,
    newSchedules: CreateScheduleDto[],
  ) {
    const medicInfo = await this.medicInfoRepo.findOne({
      where: { user: { id: user.id } },
    });

    const assistantInfo = await this.assistantInfoRepo.findOne({
      where: { user: { id: user.id } },
    });

    const ownerId = medicInfo?.id ?? assistantInfo?.id;
    const isMedic = Boolean(medicInfo);

    const existingSchedules = await this.scheduleRepo.find({
      where: isMedic
        ? { medicInfo: { id: ownerId } }
        : { assistantInfo: { id: ownerId } },
    });

    // Validate new schedules
    if (hasDuplicateSchedules(newSchedules)) {
      throw new BadRequestException('Schedules are duplicated.');
    }

    if (hasOverlappingSchedules(newSchedules)) {
      throw new BadRequestException('Schedules are overlapping.');
    }

    // Validate against existing schedules
    for (const schedule of newSchedules) {
      if (
        isDuplicateSchedule(
          { ...schedule, id: 'new' },
          existingSchedules,
          'new',
        )
      ) {
        throw new BadRequestException('Schedule already exists.');
      }

      if (
        isOverlappingSchedule(
          { ...schedule, id: 'new' },
          existingSchedules,
          'new',
        )
      ) {
        throw new BadRequestException('Schedule overlaps with existing one.');
      }
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

  async update(id: string, dto: UpdateScheduleDto) {
    const existing = await this.scheduleRepo.findOne({
      where: { id },
      relations: ['medicInfo', 'assistantInfo'],
    });

    if (!existing) {
      throw new NotFoundException('The schedule does not exist.');
    }

    const ownerId = existing.medicInfo?.id ?? existing.assistantInfo?.id;
    const isMedic = Boolean(existing.medicInfo);

    const allSchedules = await this.scheduleRepo.find({
      where: isMedic
        ? { medicInfo: { id: ownerId } }
        : { assistantInfo: { id: ownerId } },
    });

    if (isDuplicateSchedule({ ...dto, id }, allSchedules, id)) {
      throw new BadRequestException('The schedule is duplicated.');
    }

    if (isOverlappingSchedule({ ...dto, id }, allSchedules, id)) {
      throw new BadRequestException('The schedule is overlapping.');
    }

    await this.scheduleRepo.update(id, dto);

    return {
      message: 'Schedule successfully updated.',
      schedule: await this.scheduleRepo.findOneBy({ id }),
    };
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
