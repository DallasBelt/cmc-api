import { PartialType } from '@nestjs/swagger';
import { CreateScheduleDto } from './create-schedule.dto';
import { IsUUID } from 'class-validator';

export class UpdateScheduleDto extends PartialType(CreateScheduleDto) {}
