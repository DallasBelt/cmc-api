import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { envs } from './config';

import { AuthModule } from './auth/auth.module';
import { UserInfoModule } from './user-info/user-info.module';
import { MedicInfoModule } from './medic-info/medic-info.module';
import { AssistantInfoModule } from './assistant-info/assistant-info.module';
import { ScheduleModule } from './schedule/schedule.module';
import { PatientModule } from './patient/patient.module';
import { MedicalRecordModule } from './medical-record/medical.record.module';
import { AppointmentModule } from './appointment/appointment.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: envs.dbHost,
      port: envs.dbPort,
      database: envs.dbName,
      username: envs.dbUsername,
      password: envs.dbPassword,
      autoLoadEntities: true,
      synchronize: true,
    }),
    AuthModule,
    UserInfoModule,
    MedicInfoModule,
    AssistantInfoModule,
    ScheduleModule,
    PatientModule,
    MedicalRecordModule,
    AppointmentModule,
  ],
})
export class AppModule {}
