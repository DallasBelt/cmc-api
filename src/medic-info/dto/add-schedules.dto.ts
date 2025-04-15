import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { CreateMedicScheduleDto } from './create-medic-schedule.dto';

export class AddSchedulesDto {
  @ValidateNested({ each: true })
  @Type(() => CreateMedicScheduleDto)
  schedules: CreateMedicScheduleDto[];
}
