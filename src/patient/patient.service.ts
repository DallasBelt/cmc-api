import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Patient } from './entities/patient.entity';
import { User } from 'src/auth/entities/user.entity';
import { AssistantInfo } from 'src/assistant-info/entities/assistant-info.entity';

import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { PaginationDto } from '../common/dto/pagination.dtos';

@Injectable()
export class PatientService {
  private readonly logger = new Logger('PatientService');

  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    @InjectRepository(AssistantInfo)
    private readonly assistantInfoRepository: Repository<AssistantInfo>,
  ) {}

  async create(createPatientDto: CreatePatientDto, user: User) {
    let medic: User | null = null;

    if (user.role === 'medic') {
      medic = user;
    } else if (user.role === 'assistant') {
      const assistantInfo = await this.assistantInfoRepository.findOne({
        where: { user: { id: user.id } },
        relations: ['medic'],
      });

      medic = assistantInfo?.medic ?? null;
    }

    if (!medic) {
      throw new NotFoundException('El usuario no es médico o no está asignado a ningún médico.');
    }

    const patientInfo = this.patientRepository.create({
      ...createPatientDto,
      medic,
    });

    await this.patientRepository.save(patientInfo);

    return patientInfo;
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;
    const [patients, total] = await this.patientRepository.findAndCount({
      where: { isDeleted: false },
      relations: ['medic'],
      take: limit,
      skip: (page - 1) * limit,
    });
    return {
      data: patients,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string) {
    const findPatient = await this.patientRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['medic'],
    });
    if (!findPatient) throw new NotFoundException(`Patient with id: ${id} not found`);
    return findPatient;
  }

  async update(id: string, updatePatientDto: UpdatePatientDto) {
    const findPatient = await this.findOne(id);
    const patientToUpdate = await this.patientRepository.preload({
      id: findPatient.id,
      ...updatePatientDto,
    });
    await this.patientRepository.save(patientToUpdate);
    return this.findOne(id);
  }

  async remove(id: string) {
    const findPatient = await this.findOne(id);
    const patientToRemove = await this.patientRepository.preload({
      id: findPatient.id,
      isDeleted: true,
    });
    await this.patientRepository.save(patientToRemove);
    return patientToRemove;
  }

  private handleExceptions(error: any): never {
    if (error.code === '23505') {
      if (error.detail.includes('dni') || error.detail.includes('email')) {
        throw new BadRequestException('Datos duplicados.');
      }
    }
    this.logger.error(error);
    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}
