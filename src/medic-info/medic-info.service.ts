import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MedicInfo } from './entities/medic-info.entity';
import { MedicSchedule } from './entities/medic-schedule.entity';
import { User } from 'src/auth/entities/user.entity';

import { CreateMedicInfoDto } from './dto/create-medic-info.dto';
import { UpdateMedicInfoDto } from './dto/update-medic-info.dto';
import { CreateMedicScheduleDto } from './dto/create-medic-schedule.dto';
import { UpdateMedicScheduleDto } from './dto/update-medic-schedule.dto';

import {
  isDuplicateSchedule,
  isOverlappingSchedule,
  hasDuplicateSchedules,
  hasOverlappingSchedules,
} from './utils/schedule-utils';

@Injectable()
export class MedicInfoService {
  private readonly logger = new Logger('MedicInfoService');

  constructor(
    @InjectRepository(MedicInfo)
    private readonly medicInfoRepository: Repository<MedicInfo>,

    @InjectRepository(MedicSchedule)
    private readonly medicScheduleRepository: Repository<MedicSchedule>,
  ) {}

  async create(user: User, createMedicInfoDto: CreateMedicInfoDto) {
    try {
      const existingMedic = await this.medicInfoRepository.findOne({
        where: { user: { id: user.id } },
      });

      if (existingMedic) {
        throw new BadRequestException('User already has a medic profile.');
      }

      const existingRegistry = await this.medicInfoRepository.findOne({
        where: { registry: createMedicInfoDto.registry },
      });
      if (existingRegistry) {
        throw new BadRequestException('Medical registry is already in use.');
      }

      const schedules = createMedicInfoDto.schedules;

      if (!schedules || schedules.length === 0) {
        throw new BadRequestException('User must add at least one schedule.');
      }

      if (hasDuplicateSchedules(schedules)) {
        throw new BadRequestException('Schedules are duplicated.');
      }

      if (hasOverlappingSchedules(schedules)) {
        throw new BadRequestException('Schedules are overlapping.');
      }

      const medicInfo = this.medicInfoRepository.create({
        registry: createMedicInfoDto.registry,
        speciality: createMedicInfoDto.speciality,
        user,
      });

      await this.medicInfoRepository.save(medicInfo);

      for (const scheduleDto of schedules) {
        const schedule = this.medicScheduleRepository.create({
          ...scheduleDto,
          medicInfo,
        });
        await this.medicScheduleRepository.save(schedule);
      }

      return medicInfo;
    } catch (error) {
      this.logger.error(error);

      throw new InternalServerErrorException(
        'Unexpected error while creating medic profile.',
      );
    }
  }

  async addSchedules(user: User, newSchedules: CreateMedicScheduleDto[]) {
    const medicInfo = await this.medicInfoRepository.findOne({
      where: { user: { id: user.id } },
      relations: ['schedules'],
    });

    if (!medicInfo) {
      throw new NotFoundException('Medic profile not found for user.');
    }

    const existingSchedules = await this.medicScheduleRepository.find({
      where: { medicInfo: { id: medicInfo.id } },
    });

    const allSchedules = [...existingSchedules, ...newSchedules];

    if (hasDuplicateSchedules(allSchedules)) {
      throw new BadRequestException('Schedules are duplicated.');
    }

    if (hasOverlappingSchedules(allSchedules)) {
      throw new BadRequestException('Schedules are overlapping.');
    }

    for (const scheduleDto of newSchedules) {
      const schedule = this.medicScheduleRepository.create({
        ...scheduleDto,
        medicInfo,
      });
      await this.medicScheduleRepository.save(schedule);
    }

    return this.medicScheduleRepository.find({
      where: { medicInfo: { id: medicInfo.id } },
    });
  }

  async findMedicInfoByUser(user: User) {
    const medicInfo = await this.medicInfoRepository.findOne({
      where: { user: user },
      relations: ['schedules'],
    });

    if (!medicInfo) {
      throw new NotFoundException(`User with id: ${user.id} not found.`);
    }

    return medicInfo;
  }

  async updateMedicInfo(user: User, dto: UpdateMedicInfoDto) {
    const medicInfo = await this.medicInfoRepository.findOne({
      where: { user: { id: user.id } },
    });

    if (!medicInfo) {
      throw new NotFoundException('Medic profile not found.');
    }

    const updated = this.medicInfoRepository.merge(medicInfo, dto);
    return this.medicInfoRepository.save(updated);
  }

  async updateSchedule(
    scheduleId: string,
    user: User,
    dto: UpdateMedicScheduleDto,
  ) {
    const schedule = await this.medicScheduleRepository.findOne({
      where: {
        id: scheduleId,
        medicInfo: { user: { id: user.id } },
      },
      relations: ['medicInfo', 'medicInfo.user'],
    });

    if (!schedule) {
      throw new NotFoundException(
        `Schedule with id ${scheduleId} not found for this user.`,
      );
    }

    const updatedSchedule = this.medicScheduleRepository.merge(schedule, dto);

    if (updatedSchedule.checkIn >= updatedSchedule.checkOut) {
      throw new BadRequestException('checkIn must be earlier than checkOut.');
    }

    const otherSchedules = await this.medicScheduleRepository.find({
      where: {
        medicInfo: { id: schedule.medicInfo.id },
      },
    });

    if (
      isDuplicateSchedule(
        { ...dto, id: scheduleId },
        otherSchedules,
        scheduleId,
      )
    ) {
      throw new BadRequestException('This schedule is already registered.');
    }

    if (
      isOverlappingSchedule(
        { ...dto, id: scheduleId },
        otherSchedules,
        scheduleId,
      )
    ) {
      throw new BadRequestException('Updated schedule overlaps with another.');
    }

    return this.medicScheduleRepository.save(updatedSchedule);
  }

  async deleteScheduleById(scheduleId: string, user: User) {
    const schedule = await this.medicScheduleRepository.findOne({
      where: {
        id: scheduleId,
        medicInfo: { user: { id: user.id } },
      },
      relations: ['medicInfo', 'medicInfo.user'],
    });

    if (!schedule) {
      throw new NotFoundException(
        `No schedule found with id: ${scheduleId} for this user.`,
      );
    }

    const totalSchedules = await this.medicScheduleRepository.count({
      where: {
        medicInfo: { id: schedule.medicInfo.id },
      },
    });

    if (totalSchedules <= 1) {
      throw new BadRequestException(
        'You must have at least one schedule. Cannot delete the last one.',
      );
    }

    await this.medicScheduleRepository.remove(schedule);

    return { message: 'Schedule deleted successfully.' };
  }
}
