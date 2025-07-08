import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class BloodPressureDto {
  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsNumber()
  systolic: number | null;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsNumber()
  diastolic: number | null;
}

export class CreateMedicalRecordDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  diagnostic: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  treatment: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  prescription: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  bodyTemperature: string;

  @ApiProperty({ required: false, type: () => BloodPressureDto, nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => BloodPressureDto)
  bloodPressure?: BloodPressureDto;

  @ApiProperty()
  @IsString()
  @IsOptional()
  heartRate: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  respiratoryRate: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  weight: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  height: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  symptoms: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  observations: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  oxygenSaturation?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  allergies?: string;

  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  patientId: string;
}
