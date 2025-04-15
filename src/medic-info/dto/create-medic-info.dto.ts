import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateMedicScheduleDto } from './create-medic-schedule.dto';
import { IsUniqueRegistry } from 'src/common/validators';

export class CreateMedicInfoDto {
  @ApiProperty()
  @IsArray()
  @IsNotEmpty()
  speciality: string[];

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsUniqueRegistry({ message: 'Medical registry already in use.' })
  registry: string;

  @ApiProperty({ type: [CreateMedicScheduleDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMedicScheduleDto)
  @IsNotEmpty()
  schedules: CreateMedicScheduleDto[];
}
