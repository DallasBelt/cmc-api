import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

import { TransformDateWithHour } from 'src/common/transformers/date.transformer';
import { AppointmentStatus } from '../enums/appointment-status.enum';

export class CreateAppointmentDto {
  @ApiProperty()
  @IsDate()
  @TransformDateWithHour()
  @IsNotEmpty()
  startTime: Date;

  @ApiProperty()
  @IsDate()
  @TransformDateWithHour()
  @IsNotEmpty()
  endTime: Date;

  @ApiPropertyOptional({
    enum: AppointmentStatus,
    default: AppointmentStatus.Pending,
  })
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  patientId: string;

  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  medicId: string;
}
