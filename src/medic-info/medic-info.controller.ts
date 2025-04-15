import { Controller, Post, Patch, Body } from '@nestjs/common';

import { Auth, GetUser } from 'src/auth/decorators';

import { MedicInfo } from './entities/medic-info.entity';
import { MedicInfoService } from './medic-info.service';
import { User } from 'src/auth/entities/user.entity';

import { AddSchedulesDto } from './dto/add-schedules.dto';
import { CreateMedicInfoDto } from './dto/create-medic-info.dto';
import { CreateMedicScheduleDto } from './dto/create-medic-schedule.dto';
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

  @Patch('schedules')
  @Auth(ValidRoles.medic)
  addSchedules(@GetUser() user: User, @Body() body: AddSchedulesDto) {
    return this.medicInfoService.addSchedules(user, body.schedules);
  }
}
