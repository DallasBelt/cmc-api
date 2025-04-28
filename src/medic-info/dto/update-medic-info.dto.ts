import { IsNotEmpty, IsString } from 'class-validator';
import { IsValidSpecialties } from 'src/common/validators/is-valid-specialties.validator';

export class UpdateMedicInfoDto {
  @IsString({ message: 'Specialty must be a string.' })
  @IsNotEmpty({ message: 'Specialty is required.' })
  @IsValidSpecialties({ message: 'Invalid specialty.' })
  speciality: string;
}
