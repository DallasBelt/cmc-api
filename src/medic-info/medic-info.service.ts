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
import { CreateMedicScheduleDto } from './dto/create-medic-schedule.dto';
import { UpdateMedicInfoDto } from './dto/update-medic-info.dto';

import {
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
}
