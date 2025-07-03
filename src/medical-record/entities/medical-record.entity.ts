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
  diagnostic?: string;

  @Column('text')
  treatment?: string;

  @Column('text')
  prescription?: string;

  @Column('text', { name: 'body_temperature' })
  bodyTemperature?: string;

  @Column('text', { name: 'blood_pressure' })
  bloodPressure?: string;

  @Column('text', { name: 'heart_rate' })
  heartRate?: string;

  @Column('text', { name: 'respiratory_rate' })
  respiratoryRate?: string;

  @Column('text')
  weight?: string;

  @Column('text')
  height?: string;

  @Column('text')
  symptoms?: string;

  @Column('text')
  observations?: string;

  @Column('text', { name: 'oxygen_saturation' })
  oxygenSaturation?: string;

  @Column('text')
  allergies?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Patient, (patient) => patient.medicalRecord, {
    onDelete: 'CASCADE',
  })
  patient: Patient;
}
