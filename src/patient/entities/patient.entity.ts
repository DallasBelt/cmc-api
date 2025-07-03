import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from 'src/auth/entities/user.entity';
import { MedicalRecord } from 'src/medical-record/entities/medical-record.entity';
import { Appointment } from 'src/appointment/entities/appointment.entity';

@Entity('patient')
export class Patient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', { name: 'dni_type' })
  dniType: string;

  @Column('text', { unique: true })
  dni: string;

  @Column('text', { unique: true })
  email: string;

  @Column('text', { name: 'first_name' })
  firstName: string;

  @Column('text', { name: 'last_name' })
  lastName: string;

  @Column('date')
  dob: Date;

  @Column('text')
  phone: string;

  @Column('text')
  address: string;

  @Column('text')
  occupation: string;

  @Column('boolean', { default: false, name: 'is_deleted' })
  isDeleted: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.patient, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'medic_id' })
  medic: User;

  @OneToMany(() => MedicalRecord, (medicalRecord) => medicalRecord.patient, {
    cascade: true,
  })
  medicalRecord: MedicalRecord[];

  @OneToMany(() => Appointment, (appointment) => appointment.patient)
  appointments: Appointment[];
}
