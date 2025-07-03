import {
  Column,
  Entity,
  JoinColumn,
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
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToOne(() => Schedule, (schedule) => schedule.medicInfo)
  schedule: Schedule;
}
