import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan, Not } from 'typeorm';

import { Appointment } from './entities/appointment.entity';
import { User } from 'src/auth/entities/user.entity';

import { PatientService } from 'src/patient/patient.service';

import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class AppointmentService {
  private readonly logger = new Logger('PatientService');

  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly patientService: PatientService,
  ) {}

  async create(createAppointmentDto: CreateAppointmentDto): Promise<{ message: string }> {
    const { startTime, endTime, reason, patientId, medicId } = createAppointmentDto;

    const patient = await this.patientService.findOne(patientId);
    const medic = await this.userRepository.findOne({ where: { id: medicId } });

    if (!medic || medic.role !== 'medic') {
      throw new NotFoundException('El usuario no es un médico válido.');
    }

    const existingAppointment = await this.appointmentRepository.findOne({
      where: {
        medic,
        startTime: LessThan(endTime),
        endTime: MoreThan(startTime),
      },
    });

    if (existingAppointment) {
      throw new ConflictException('Ya existe una cita en este intervalo de tiempo.');
    }

    const appointment = this.appointmentRepository.create({
      date: new Date(),
      startTime,
      endTime,
      reason,
      patient,
      medic,
    });

    await this.appointmentRepository.save(appointment);

    return { message: 'Cita creada exitosamente.' };
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;
    const [appointments, total] = await this.appointmentRepository.findAndCount({
      relations: ['patient', 'medic'],
      take: limit,
      skip: (page - 1) * limit,
    });
    return {
      data: appointments,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
      relations: ['patient', 'medic'],
    });

    if (!appointment) {
      throw new NotFoundException(`No se encontró la cita con id: ${id}`);
    }

    return appointment;
  }

  async update(id: string, dto: UpdateAppointmentDto): Promise<{ message: string }> {
    const { startTime, endTime, medicId } = dto;

    const appointment = await this.findOne(id);

    if (medicId && (startTime || endTime)) {
      const conflict = await this.appointmentRepository.findOne({
        where: {
          medic: { id: medicId || appointment.medic.id },
          startTime: LessThan(endTime || appointment.endTime),
          endTime: MoreThan(startTime || appointment.startTime),
          id: Not(id),
        },
      });

      if (conflict) {
        throw new ConflictException('Ya existe una cita en este intervalo de tiempo.');
      }
    }

    const appointmentToUpdate = await this.appointmentRepository.preload({
      id: appointment.id,
      ...dto,
    });

    if (!appointmentToUpdate) {
      throw new NotFoundException('No se pudo actualizar la cita. No encontrada.');
    }

    await this.appointmentRepository.save(appointmentToUpdate);
    return { message: 'Cita actualizada exitosamente.' };
  }

  async remove(id: string): Promise<{ message: string }> {
    const appointment = await this.appointmentRepository.findOne({ where: { id } });

    if (!appointment) {
      throw new NotFoundException(`No se encontró la cita con id: ${id}`);
    }

    await this.appointmentRepository.remove(appointment);
    return { message: `Cita con ID ${id} eliminada exitosamente.` };
  }
}
