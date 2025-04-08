import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Patient } from 'src/patient/entities/patient.entity';

@Entity('medical-record')
export class MedicalRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  diagnostic?: string;

  @Column('text')
  treatment?: string;

  @Column('text')
  prescription?: string;

  @Column('text')
  bodyTemperature?: string;

  @Column('text')
  bloodPressure?: string;

  @Column('text')
  heartRate?: string;

  @Column('text')
  respiratoryRate?: string;

  @Column('text')
  weight?: string;

  @Column('text')
  height?: string;

  @Column('text')
  symptoms?: string;

  @Column('text')
  observations?: string;

  @Column('text')
  oxygenSaturation?: string;

  @Column('text')
  allergies?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Patient, (patient) => patient.medicalRecord, {
    onDelete: 'CASCADE',
  })
  patient: Patient;
}
