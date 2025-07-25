import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsEmail, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { IsValidDni } from '../decorators/dni-validator.decorator';
import { TransformDate } from '../../common/transformers/date.transformer';

export class CreatePatientDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsIn(['cedula', 'pasaporte', 'ruc'], {
    message: 'dniType must be "cedula", "pasaporte" or "ruc"',
  })
  dniType: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsValidDni()
  dni: string;

  @ApiProperty()
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty()
  @IsDate()
  @TransformDate()
  @IsNotEmpty()
  dob: Date;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  occupation: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  allergies?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  personalHistory?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  familyHistory?: string;
}
