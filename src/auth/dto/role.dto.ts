import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsString } from 'class-validator';

import { ValidRoles } from '../enums';

export class RoleDto {
  @ApiProperty()
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsEnum(ValidRoles)
  role: ValidRoles;
}
