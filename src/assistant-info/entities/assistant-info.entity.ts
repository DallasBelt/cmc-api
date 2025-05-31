import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from 'src/auth/entities/user.entity';
import { Schedule } from 'src/schedule/entities/schedule.entity';

@Entity('assistant_info')
export class AssistantInfo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, (user) => user.assistantInfo, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @OneToOne(() => User, (user) => user.assistant, { onDelete: 'CASCADE' })
  @JoinColumn()
  medic: User;

  @OneToOne(() => Schedule, (schedule) => schedule.assistantInfo)
  schedule: Schedule;
}
