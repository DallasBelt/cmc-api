import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

import { IsValidSpecialties } from 'src/common/validators/is-valid-specialties.validator';

export class CreateMedicInfoDto {
  @ApiProperty()
  @IsString({ message: 'Specialty must be a string.' })
  @IsNotEmpty({ message: 'Specialty is required.' })
  @IsValidSpecialties({ message: 'Invalid specialty.' })
  speciality: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Registry is required.' })
  @IsString({ message: 'Registry must be a string.' })
  registry: string;
}
