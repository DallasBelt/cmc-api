import { IsArray, IsString } from 'class-validator';

export class AssignAssistantsDto {
  @IsString()
  medicId: string;

  @IsArray()
  @IsString({ each: true })
  assistantIds: string[];
}
