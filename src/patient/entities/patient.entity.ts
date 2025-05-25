import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from 'src/auth/entities/user.entity';
import { MedicalRecord } from 'src/medical-record/entities/medical-record.entity';
import { Appointment } from 'src/appointment/entities/appointment.entity';

@Entity('patient')
export class Patient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  dniType: string;

  @Column('text', { unique: true })
  dni: string;

  @Column('text', { unique: true })
  email: string;

  @Column('text')
  firstName: string;

  @Column('text')
  lastName: string;

  @Column('date')
  dob: Date;

  @Column('text')
  phone: string;

  @Column('text')
  address: string;

  @Column('text')
  occupation: string;

  @Column('boolean', { default: false })
  isDeleted: boolean;

  @ManyToOne(() => User, (user) => user.patient, { onDelete: 'CASCADE' })
  medic: User;

  @OneToMany(() => MedicalRecord, (medicalRecord) => medicalRecord.patient, {
    cascade: true,
  })
  medicalRecord: MedicalRecord[];

  @OneToMany(() => Appointment, (appointment) => appointment.patient)
  appointments: Appointment[];
}
