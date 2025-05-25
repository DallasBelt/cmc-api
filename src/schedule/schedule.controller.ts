import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { GetUser, Auth } from 'src/auth/decorators';
import { User } from 'src/auth/entities/user.entity';
import { Schedule } from './entities/schedule.entity';
import { ValidRoles } from 'src/auth/interfaces';

import { ScheduleService } from './schedule.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';

@ApiTags('schedule')
@Controller('schedule')
@Auth(ValidRoles.medic, ValidRoles.assistant)
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Post()
  create(
    @GetUser() user: User,
    @Body() body: CreateScheduleDto[],
  ): Promise<{ message: string; schedules: Schedule[] }> {
    return this.scheduleService.create(body, user);
  }

  @Get()
  findAll(
    @GetUser() user: User,
    @Query('medicInfoId') medicId?: string,
    @Query('assistantInfoId') assistantId?: string,
  ) {
    return this.scheduleService.findByParent(user, medicId, assistantId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateScheduleDto,
    @GetUser() user: User,
  ) {
    return this.scheduleService.update(id, dto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.scheduleService.remove(id);
  }
}
