import { Controller, Get, Post, Body, Patch, Param, ParseUUIDPipe, Query } from '@nestjs/common';

import { Auth } from 'src/auth/decorators';

import { MedicalRecordService } from './medical-record.service';

import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

import { ValidRoles } from 'src/auth/enums';

@Controller('medical-record')
@Auth(ValidRoles.Admin, ValidRoles.Medic)
export class MedicalRecordController {
  constructor(private readonly medicalRecordService: MedicalRecordService) {}

  @Post()
  create(@Body() createMedicalRecordDto: CreateMedicalRecordDto): Promise<{ message: string }> {
    return this.medicalRecordService.create(createMedicalRecordDto);
  }

  @Get('/patient/:patientId')
  findByPatientId(
    @Param('patientId', ParseUUIDPipe) patientId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.medicalRecordService.findByPatientId(patientId, paginationDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.medicalRecordService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.medicalRecordService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMedicalRecordDto: UpdateMedicalRecordDto,
  ) {
    return this.medicalRecordService.update(id, updateMedicalRecordDto);
  }
}
