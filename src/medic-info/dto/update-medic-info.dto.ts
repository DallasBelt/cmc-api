import { IsArray, ArrayNotEmpty } from 'class-validator';
import { IsValidSpecialties } from 'src/common/validators/is-valid-specialties.validator';

export class UpdateMedicInfoDto {
  @IsArray()
  @ArrayNotEmpty({ message: 'At least one specialty must be selected.' })
  @IsValidSpecialties({ message: 'One or more specialties are invalid.' })
  speciality: string[];
}
