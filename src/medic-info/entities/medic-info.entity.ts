import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from 'src/auth/entities/user.entity';
import { Schedule } from 'src/schedule/entities/schedule.entity';

@Entity('medic_info')
export class MedicInfo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', { unique: true })
  registry: string;

  @Column('text')
  speciality: string;

  @OneToOne(() => User, (user) => user.medicInfo, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @OneToMany(() => Schedule, (schedule) => schedule.assistantInfo)
  schedules: Schedule[];
}
