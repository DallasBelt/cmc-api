import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, ValidateNested } from 'class-validator';
import { ShiftDto } from './shift.dto';

export class CreateScheduleDto {
  @ApiProperty({
    type: [ShiftDto],
    description: 'Array of shifts that form the full schedule',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ShiftDto)
  @ArrayMinSize(1)
  shifts: ShiftDto[];
}
