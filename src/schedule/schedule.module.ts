import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Schedule } from './entities/schedule.entity';
import { ScheduleService } from './schedule.service';
import { ScheduleController } from './schedule.controller';
import { AuthModule } from 'src/auth/auth.module';
import { MedicInfoModule } from '../medic-info/medic-info.module';
import { MedicInfo } from 'src/medic-info/entities/medic-info.entity';
import { AssistantInfo } from 'src/assistant-info/entities/assistant-info.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Schedule, MedicInfo, AssistantInfo]),
    forwardRef(() => MedicInfoModule),
    AuthModule,
  ],
  controllers: [ScheduleController],
  providers: [ScheduleService],
  exports: [ScheduleService],
})
export class ScheduleModule {}
