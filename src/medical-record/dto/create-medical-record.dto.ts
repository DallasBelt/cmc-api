import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

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

  @ApiProperty()
  @IsString()
  @IsOptional()
  bloodPressure: string;

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
