import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { MedicInfo } from 'src/medic-info/entities/medic-info.entity';

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
  @JoinColumn({ name: 'medic_info_id' })
  medicInfo?: MedicInfo;
}
