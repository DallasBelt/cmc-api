import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { MedicInfo } from 'src/medic-info/entities/medic-info.entity';
import { AssistantInfo } from 'src/assistant-info/entities/assistant-info.entity';

@Entity('schedule')
export class Schedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('jsonb')
  shifts: {
    checkIn: string;
    checkOut: string;
    days: string[];
  }[];

  // MedicInfo relationship
  @OneToOne(() => MedicInfo, (medicInfo) => medicInfo.schedule, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  medicInfo?: MedicInfo;

  // AssistantInfo relationship
  @OneToOne(() => AssistantInfo, (assistantInfo) => assistantInfo.schedule, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  assistantInfo?: AssistantInfo;
}
