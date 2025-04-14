import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { MedicInfo } from './medic-info.entity';

@Entity('medic-schedule')
export class MedicSchedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  day: string; // Ej: 'monday', 'tuesday', etc.

  @Column('text')
  checkIn: string; // Ej: '08:00'

  @Column('text')
  checkOut: string; // Ej: '12:00'

  @ManyToOne(() => MedicInfo, (medicInfo) => medicInfo.schedules, {
    onDelete: 'CASCADE',
  })
  medicInfo: MedicInfo;
}
