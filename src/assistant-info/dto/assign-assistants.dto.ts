import { IsArray, IsString, ArrayNotEmpty } from 'class-validator';

export class AssignAssistantsDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  assistantIds: string[];

  @IsString()
  medicId: string;
}
