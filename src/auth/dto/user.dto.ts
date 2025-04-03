import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Matches } from 'class-validator';

export class UserDto {
  @ApiProperty()
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @Matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&]).{8,40}$/, {
    message:
      'Password must have at least one uppercase letter, one lowercase letter, and one special character (!@#$%^&).',
  })
  password: string;
}
