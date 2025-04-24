import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';
import {
  IsCheckInBeforeCheckOut,
  IsValidDays,
  IsValidTimeSlot,
} from 'src/common/validators';

export class CreateMedicScheduleDto {
  @ApiProperty({
    example: '08:00',
    description: 'Check-in time with format HH:mm',
  })
  @IsString()
  @IsValidTimeSlot()
  checkIn: string;

  @ApiProperty({
    example: '13:00',
    description: 'Check-out time with format HH:mm',
  })
  @IsString()
  @IsValidTimeSlot()
  @IsCheckInBeforeCheckOut()
  checkOut: string;

  @ApiProperty({
    example: ['monday', 'tuesday', 'wednesday'],
    description: 'Days where the schedule applies.',
  })
  @IsArray()
  @IsNotEmpty()
  @IsValidDays()
  days: string[];
}
