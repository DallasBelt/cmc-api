import { Body, Controller, Get, Patch, Post } from '@nestjs/common';

import { Auth, GetUser } from 'src/auth/decorators';

import { MedicInfoService } from './medic-info.service';
import { MedicInfo } from './entities/medic-info.entity';
import { User } from 'src/auth/entities/user.entity';

import { CreateMedicInfoDto } from './dto/create-medic-info.dto';
import { UpdateMedicInfoDto } from './dto/update-medic-info.dto';

import { ValidRoles } from 'src/auth/enums';

@Controller('medic-info')
@Auth()
export class MedicInfoController {
  constructor(private readonly medicInfoService: MedicInfoService) {}

  @Post()
  @Auth(ValidRoles.Medic)
  create(
    @GetUser() user: User,
    @Body() createMedicInfoDto: CreateMedicInfoDto,
  ): Promise<MedicInfo> {
    return this.medicInfoService.create(user, createMedicInfoDto);
  }

  @Get()
  @Auth(ValidRoles.Medic)
  findMedicInfoByUser(@GetUser() user: User) {
    return this.medicInfoService.findMedicInfoByUser(user);
  }

  @Patch()
  @Auth(ValidRoles.Medic)
  updateMedicInfo(@GetUser() user: User, @Body() dto: UpdateMedicInfoDto) {
    return this.medicInfoService.updateMedicInfo(user, dto);
  }
}
