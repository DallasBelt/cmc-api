import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { UserInfo } from 'src/user-info/entities/user-info.entity';
import { MedicInfo } from 'src/medic-info/entities/medic-info.entity';
import { AssistantInfo } from 'src/assistant-info/entities/assistant-info.entity';
import { Patient } from 'src/patient/entities/patient.entity';
import { Appointment } from 'src/appointment/entities/appointment.entity';

import { UserStatus, ValidRoles } from '../enums';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', { unique: true })
  email: string;

  @Column('text', { select: false })
  password: string;

  @Column('enum', {
    enum: ValidRoles,
    default: ValidRoles.User,
  })
  role: ValidRoles;

  @Column('enum', {
    enum: UserStatus,
    default: UserStatus.Pending,
  })
  status: UserStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => UserInfo, (userInfo) => userInfo.user, { cascade: true })
  userInfo: UserInfo;

  @OneToOne(() => MedicInfo, (medicInfo) => medicInfo.user, { cascade: true })
  medicInfo: MedicInfo;

  @OneToOne(() => AssistantInfo, (assistantInfo) => assistantInfo.user, {
    cascade: true,
  })
  assistantInfo: AssistantInfo;

  @OneToMany(() => AssistantInfo, (assistantInfo) => assistantInfo.medic)
  assistants: AssistantInfo[];

  @OneToMany(() => Patient, (patient) => patient.medic, { cascade: true })
  patient: Patient[];

  @OneToMany(() => Appointment, (appointment) => appointment.medic, {
    cascade: true,
  })
  appointments: Appointment[];

  @BeforeInsert()
  checkFieldsBeforeInsert() {
    if (this.email) {
      this.email = this.email.toLowerCase().trim();
    }
  }

  @BeforeUpdate()
  checkFieldsBeforeUpdate() {
    this.checkFieldsBeforeInsert();
  }
}
