import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { MedicInfo } from './medic-info.entity';

@Entity('medic-schedule')
export class MedicSchedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', { array: true })
  days: string[];

  @Column('text')
  checkIn: string;

  @Column('text')
  checkOut: string;

  @ManyToOne(() => MedicInfo, (medicInfo) => medicInfo.schedules, {
    onDelete: 'CASCADE',
  })
  medicInfo: MedicInfo;
}
