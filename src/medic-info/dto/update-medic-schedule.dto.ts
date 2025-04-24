import { PartialType } from '@nestjs/swagger';
import { CreateMedicScheduleDto } from './create-medic-schedule.dto';

export class UpdateMedicScheduleDto extends PartialType(
  CreateMedicScheduleDto,
) {}
