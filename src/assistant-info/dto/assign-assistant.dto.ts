import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignAssistantDto {
  @ApiProperty()
  @IsUUID()
  assistantId: string;

  @ApiProperty()
  @IsUUID()
  medicId: string;
}
