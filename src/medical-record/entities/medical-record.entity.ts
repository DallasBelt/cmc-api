import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Patient } from 'src/patient/entities/patient.entity';

@Entity('medical_record')
export class MedicalRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  symptoms?: string;

  @Column('text')
  diagnostic?: string;

  @Column('text')
  treatment?: string;

  @Column('text', { nullable: true })
  prescription?: string;

  @Column('jsonb', { name: 'blood_pressure', nullable: true })
  bloodPressure?: {
    systolic: number | null;
    diastolic: number | null;
  };

  @Column('text', { name: 'oxygen_saturation', nullable: true })
  oxygenSaturation?: string;

  @Column('text', { name: 'body_temperature', nullable: true })
  bodyTemperature?: string;

  @Column('text', { name: 'heart_rate', nullable: true })
  heartRate?: string;

  @Column('text', { name: 'respiratory_rate', nullable: true })
  respiratoryRate?: string;

  @Column('text', { nullable: true })
  weight?: string;

  @Column('text', { nullable: true })
  height?: string;

  @Column('text', { nullable: true })
  observations?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Patient, (patient) => patient.medicalRecord, {
    onDelete: 'CASCADE',
  })
  patient: Patient;
}
