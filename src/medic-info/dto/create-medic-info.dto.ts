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

export class CreateMedicInfoDto {
  @ApiProperty()
  @IsArray()
  @IsNotEmpty()
  speciality: string[];

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  registry: string;

  @ApiProperty({ type: [CreateMedicScheduleDto] })
  @ArrayNotEmpty({ message: 'At least one schedule is required.' })
  @IsArray({ message: 'The schedule must be an array.' })
  @ValidateNested({ each: true })
  @Type(() => CreateMedicScheduleDto)
  schedules: CreateMedicScheduleDto[];
}
