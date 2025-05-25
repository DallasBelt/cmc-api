import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { MedicInfo } from 'src/medic-info/entities/medic-info.entity';
import { AssistantInfo } from 'src/assistant-info/entities/assistant-info.entity';

@Entity('schedule')
export class Schedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  checkIn: string;

  @Column('text')
  checkOut: string;

  @Column('text', { array: true })
  days: string[];

  // MedicInfo relationship
  @ManyToOne(() => MedicInfo, (medicInfo) => medicInfo.schedules, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  medicInfo?: MedicInfo;

  // AssistantInfo relationship
  @ManyToOne(() => AssistantInfo, (assistantInfo) => assistantInfo.schedules, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  assistantInfo?: AssistantInfo;
}
