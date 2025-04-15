import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString, Matches } from 'class-validator';
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
  // @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
  //   message: 'Check-in time must be in format HH:mm',
  // })
  checkIn: string;

  @ApiProperty({
    example: '13:00',
    description: 'Check-out time with format HH:mm',
  })
  @IsString()
  // @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
  //   message: 'Check-out time must be in format HH:mm',
  // })
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
