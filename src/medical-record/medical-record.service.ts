import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MedicalRecord } from './entities/medical-record.entity';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { PatientService } from '../patient/patient.service';

@Injectable()
export class MedicalRecordService {
  constructor(
    @InjectRepository(MedicalRecord)
    private readonly medicalRecordRepository: Repository<MedicalRecord>,
    private readonly patientService: PatientService,
  ) {}

  async create(createMedicalRecordDto: CreateMedicalRecordDto): Promise<{ message: string }> {
    const { patientId, ...rest } = createMedicalRecordDto;

    const patient = await this.patientService.findOne(patientId);
    if (!patient) {
      throw new NotFoundException('Paciente no encontrado.');
    }

    const medicalRecord = this.medicalRecordRepository.create({
      ...rest,
      patient,
    });

    await this.medicalRecordRepository.save(medicalRecord);

    return {
      message: 'Entrada creada exitosamente.',
    };
  }

  async findByPatientId(patientId: string, paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;

    const [records, total] = await this.medicalRecordRepository.findAndCount({
      where: { patient: { id: patientId } },
      relations: ['patient', 'patient.medic'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
    });

    if (!records.length) {
      throw new NotFoundException('No se encontraron historias clínicas para este paciente.');
    }

    return {
      data: records,
      total,
      page,
      limit,
    };
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;
    const [medicalRecords, total] = await this.medicalRecordRepository.findAndCount({
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
    if (!findMedicalRecord) throw new NotFoundException('No se encontró el registro.');
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
}
