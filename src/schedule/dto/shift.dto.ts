import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';
import { IsCheckInBeforeCheckOut, IsValidDays, IsValidTimeSlot } from 'src/common/validators';

export class ShiftDto {
  @ApiProperty({ example: '08:00' })
  @IsString()
  @IsValidTimeSlot()
  checkIn: string;

  @ApiProperty({ example: '13:00' })
  @IsString()
  @IsValidTimeSlot()
  @IsCheckInBeforeCheckOut()
  checkOut: string;

  @ApiProperty({ example: ['monday', 'wednesday', 'friday'] })
  @IsArray()
  @IsNotEmpty()
  @IsValidDays()
  days: string[];
}
