import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from 'src/auth/entities/user.entity';

@Entity('medic-info')
export class MedicInfo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', { array: true })
  speciality: string[];

  @Column('text', { unique: true })
  registry: string;

  @Column('text')
  checkIn: string;

  @Column('text')
  checkOut: string;

  @Column('text', { array: true })
  days: string[];

  @OneToOne(() => User, (user) => user.medicInfo, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;
}
