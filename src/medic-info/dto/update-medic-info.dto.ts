import { OmitType } from '@nestjs/swagger';
import { CreateMedicInfoDto } from './create-medic-info.dto';

export class UpdateMedicInfoDto extends OmitType(CreateMedicInfoDto, ['registry'] as const) {}
