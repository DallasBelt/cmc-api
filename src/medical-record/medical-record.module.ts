import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MedicalRecord } from './entities/medical-record.entity';

import { AuthModule } from 'src/auth/auth.module';

import { MedicalRecordService } from './medical-record.service';
import { MedicalRecordController } from './medical-record.controller';
import { PatientModule } from 'src/patient/patient.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MedicalRecord]),
    AuthModule,
    PatientModule,
  ],
  controllers: [MedicalRecordController],
  providers: [MedicalRecordService],
})
export class MedicalRecordModule {}
