import { PickType } from '@nestjs/swagger';
import { UserDto } from './user.dto';
import { IsString, IsNotEmpty } from 'class-validator';

export class UpdatePasswordDto extends PickType(UserDto, ['password'] as const) {
  @IsString()
  @IsNotEmpty({ message: 'Current password is required' })
  currentPassword: string;
}
