import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AppointmentService } from './appointment.service';

import { Auth } from 'src/auth/decorators';
import { ValidRoles } from 'src/auth/enums';

import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { PaginationDto } from 'src/common/dto/pagination.dtos';

@Controller('appointment')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Auth(ValidRoles.Admin, ValidRoles.Medic, ValidRoles.Assistant)
  @Post()
  create(@Body() createAppointmentDto: CreateAppointmentDto): Promise<{ message: string }> {
    return this.appointmentService.create(createAppointmentDto);
  }

  @Auth(ValidRoles.Admin, ValidRoles.Medic, ValidRoles.Assistant)
  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.appointmentService.findAll(paginationDto);
  }

  @Auth(ValidRoles.Admin, ValidRoles.Medic, ValidRoles.Assistant)
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.appointmentService.findOne(id);
  }

  @Auth(ValidRoles.Admin, ValidRoles.Medic, ValidRoles.Assistant)
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
  ): Promise<{ message: string }> {
    return this.appointmentService.update(id, updateAppointmentDto);
  }

  @Auth(ValidRoles.Admin, ValidRoles.Medic, ValidRoles.Assistant)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.appointmentService.remove(id);
  }
}
