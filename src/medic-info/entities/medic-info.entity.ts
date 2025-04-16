import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { MedicSchedule } from './medic-schedule.entity';
import { User } from 'src/auth/entities/user.entity';

@Entity('medic-info')
export class MedicInfo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', { array: true })
  speciality: string[];

  @Column('text', { unique: true })
  registry: string;

  @OneToOne(() => User, (user) => user.medicInfo, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @OneToMany(() => MedicSchedule, (medicSchedule) => medicSchedule.medicInfo, {
    cascade: true,
    eager: true,
  })
  schedules: MedicSchedule[];
}
