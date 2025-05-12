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

@Entity('assistant-info')
export class AssistantInfo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  checkIn: string;

  @Column('text')
  checkOut: string;

  @Column('text', { array: true })
  days: string[];

  @OneToOne(() => User, (user) => user.assistantInfo, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @OneToOne(() => User, (user) => user.assistant, { onDelete: 'CASCADE' })
  @JoinColumn()
  medic: User;

  @OneToMany(() => Schedule, (schedule) => schedule.assistantInfo)
  schedules: Schedule[];
}
