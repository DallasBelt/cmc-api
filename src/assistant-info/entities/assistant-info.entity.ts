import { Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { User } from 'src/auth/entities/user.entity';

@Entity('assistant_info')
export class AssistantInfo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, (user) => user.assistantInfo, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => User, (user) => user.assistants, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'medic_id' })
  medic: User;
}
