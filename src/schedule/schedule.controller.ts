import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { GetUser, Auth } from 'src/auth/decorators';
import { User } from 'src/auth/entities/user.entity';
import { Schedule } from './entities/schedule.entity';
import { ValidRoles } from 'src/auth/enums';

import { ScheduleService } from './schedule.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';

@ApiTags('schedule')
@Controller('schedule')
@Auth(ValidRoles.Medic, ValidRoles.Assistant)
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Post()
  create(
    @GetUser() user: User,
    @Body() body: CreateScheduleDto,
  ): Promise<{ message: string; schedule: Schedule }> {
    return this.scheduleService.create(body, user);
  }

  @Get()
  findOne(@GetUser() user: User) {
    return this.scheduleService.findByParent(user);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateScheduleDto,
    @GetUser() user: User,
  ) {
    return this.scheduleService.update(id, dto, user);
  }
}
