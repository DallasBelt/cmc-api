import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MedicalRecord } from './entities/medical-record.entity';

import { PatientService } from '../patient/patient.service';

import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';
import { PaginationDto } from 'src/common/dto/pagination.dtos';

@Injectable()
export class MedicalRecordService {
  private readonly logger = new Logger('PatientService');

  constructor(
    @InjectRepository(MedicalRecord)
    private readonly medicalRecordRepository: Repository<MedicalRecord>,
    private readonly patientService: PatientService,
  ) {}

  async create(createMedicalRecordDto: CreateMedicalRecordDto) {
    const { patientId, ...rest } = createMedicalRecordDto;
    const patient = await this.patientService.findOne(patientId);
    try {
      const medicalRecord = this.medicalRecordRepository.create({
        ...rest,
        patient,
      });
      await this.medicalRecordRepository.save(medicalRecord);
      return medicalRecord;
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;
    const [medicalRecords, total] =
      await this.medicalRecordRepository.findAndCount({
        relations: ['patient', 'patient.medic'],
        take: limit,
        skip: (page - 1) * limit,
      });
    return {
      data: medicalRecords,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string) {
    const findMedicalRecord = await this.medicalRecordRepository.findOne({
      where: { id },
      relations: ['patient', 'patient.medic'],
    });
    if (!findMedicalRecord)
      throw new NotFoundException(`Medical record with id: ${id} not found.`);
    return findMedicalRecord;
  }

  async update(id: string, updateHistoryDto: UpdateMedicalRecordDto) {
    const findMedicalRecord = await this.findOne(id);
    const medicalRecordToUpdate = await this.medicalRecordRepository.preload({
      id: findMedicalRecord.id,
      ...updateHistoryDto,
    });
    await this.medicalRecordRepository.save(medicalRecordToUpdate);
    return this.findOne(id);
  }

  private handleExceptions(error: any): never {
    if (error.code === '23505') throw new BadRequestException(error.detail);
    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error, check server logs.',
    );
  }
}
