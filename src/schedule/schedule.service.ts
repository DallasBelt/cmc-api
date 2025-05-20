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
  isDuplicateSchedule,
} from './utils/schedule-utils';
import { GetUser } from 'src/auth/decorators';

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

    // Verify duplicate schedules in the request's body
    if (hasDuplicateSchedules(schedules)) {
      throw new BadRequestException(
        'Duplicate schedules found in the request body.',
      );
    }

    // Get existing schedules
    const existingSchedules = await this.scheduleRepo.find({
      where: medicInfo
        ? { medicInfo: { id: medicInfo.id } }
        : { assistantInfo: { id: assistantInfo.id } },
    });

    // Verify duplicate schedules in the database
    if (isDuplicateSchedule(schedules, existingSchedules)) {
      throw new BadRequestException('These schedules already exist.');
    }

    // Assign an id for each schedule
    for (const schedule of schedules) {
      if (medicInfo) {
        schedule.medicInfo = medicInfo;
      } else if (assistantInfo) {
        schedule.assistantInfo = assistantInfo;
      }
    }

    // Create and save the schedules
    const createdSchedules = this.scheduleRepo.create(schedules);
    const savedSchedules = await this.scheduleRepo.save(createdSchedules);

    return {
      message: 'Schedules successfully created.',
      schedules: savedSchedules,
    };
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

  async update(id: string, dto: UpdateScheduleDto, @GetUser() user: User) {
    // Verify that the schedules exists in the database
    const existing = await this.scheduleRepo.findOne({
      where: { id },
      relations: ['medicInfo', 'assistantInfo'],
    });

    if (!existing) {
      throw new NotFoundException('The schedule does not exist.');
    }

    const medicInfo = await this.medicInfoRepo.findOne({
      where: { user: { id: user.id } },
    });

    const assistantInfo = await this.assistantInfoRepo.findOne({
      where: { user: { id: user.id } },
    });

    if (!medicInfo && !assistantInfo) {
      throw new BadRequestException(
        'User must have a profile to update a schedule.',
      );
    }

    // Get existing schedules
    const allSchedules = await this.scheduleRepo.find({
      where: medicInfo
        ? { medicInfo: { id: medicInfo.id } }
        : { assistantInfo: { id: assistantInfo.id } },
    });

    // Validate duplicates
    const filteredSchedules = allSchedules.filter(
      (schedule) => schedule.id !== id, // Don't compare current schedule
    );

    if (isDuplicateSchedule([dto], filteredSchedules)) {
      throw new BadRequestException('This schedule already exists.');
    }

    // Assign an id to the updated schedule
    if (medicInfo) {
      existing.medicInfo = medicInfo;
    } else if (assistantInfo) {
      existing.assistantInfo = assistantInfo;
    }

    // Update the schedule
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
