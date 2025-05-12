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
import { User } from 'src/auth/entities/user.entity';

import { CreateMedicInfoDto } from './dto/create-medic-info.dto';
import { UpdateMedicInfoDto } from './dto/update-medic-info.dto';

@Injectable()
export class MedicInfoService {
  private readonly logger = new Logger('MedicInfoService');

  constructor(
    @InjectRepository(MedicInfo)
    private readonly medicInfoRepository: Repository<MedicInfo>,
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

      const medicInfo = this.medicInfoRepository.create({
        registry: createMedicInfoDto.registry,
        speciality: createMedicInfoDto.speciality,
        user,
      });

      await this.medicInfoRepository.save(medicInfo);

      return medicInfo;
    } catch (error) {
      this.logger.error(error);

      throw new InternalServerErrorException(
        'Unexpected error while creating medic profile.',
      );
    }
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
}
