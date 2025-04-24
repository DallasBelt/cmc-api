import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { Auth, GetUser } from 'src/auth/decorators';

import { MedicInfoService } from './medic-info.service';
import { MedicInfo } from './entities/medic-info.entity';
import { User } from 'src/auth/entities/user.entity';

import { CreateMedicInfoDto } from './dto/create-medic-info.dto';
import { AddSchedulesDto } from './dto/add-schedules.dto';
import { UpdateMedicScheduleDto } from './dto/update-medic-schedule.dto';
import { UpdateMedicInfoDto } from './dto/update-medic-info.dto';

import { ValidRoles } from 'src/auth/interfaces';

@Controller('medic-info')
@Auth()
export class MedicInfoController {
  constructor(private readonly medicInfoService: MedicInfoService) {}

  @Post()
  @Auth(ValidRoles.medic)
  create(
    @GetUser() user: User,
    @Body() createMedicInfoDto: CreateMedicInfoDto,
  ): Promise<MedicInfo> {
    return this.medicInfoService.create(user, createMedicInfoDto);
  }

  @Get()
  @Auth(ValidRoles.medic)
  getMedicInfo(@GetUser() user: User) {
    return this.medicInfoService.findMedicInfoByUser(user);
  }

  @Patch()
  @Auth(ValidRoles.medic)
  updateMedicInfo(@GetUser() user: User, @Body() dto: UpdateMedicInfoDto) {
    return this.medicInfoService.updateMedicInfo(user, dto);
  }

  @Patch('schedules')
  @Auth(ValidRoles.medic)
  addSchedules(@GetUser() user: User, @Body() body: AddSchedulesDto) {
    return this.medicInfoService.addSchedules(user, body.schedules);
  }

  @Patch('schedules/:id')
  @Auth(ValidRoles.medic)
  updateSchedule(
    @Param('id') scheduleId: string,
    @GetUser() user: User,
    @Body() dto: UpdateMedicScheduleDto,
  ) {
    return this.medicInfoService.updateSchedule(scheduleId, user, dto);
  }

  @Delete('schedules/:id')
  @Auth(ValidRoles.medic)
  deleteSchedule(@Param('id') scheduleId: string, @GetUser() user: User) {
    return this.medicInfoService.deleteScheduleById(scheduleId, user);
  }
}
