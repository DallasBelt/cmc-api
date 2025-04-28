import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateMedicScheduleDto } from './create-medic-schedule.dto';
import { IsValidSpecialties } from 'src/common/validators/is-valid-specialties.validator';

export class CreateMedicInfoDto {
  @ApiProperty()
  @IsString({ message: 'Specialty must be a string.' })
  @IsNotEmpty({ message: 'Specialty is required.' })
  @IsValidSpecialties({ message: 'Invalid specialty.' })
  speciality: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Registry is required.' })
  @IsString({ message: 'Registry must be a string.' })
  registry: string;

  @ApiProperty({ type: [CreateMedicScheduleDto] })
  @IsArray({ message: 'The schedule must be an array.' })
  @ArrayNotEmpty({ message: 'At least one schedule is required.' })
  @ValidateNested({ each: true })
  @Type(() => CreateMedicScheduleDto)
  schedules: CreateMedicScheduleDto[];
}
