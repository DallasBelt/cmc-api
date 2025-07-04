import { Controller, Patch, Body, Get, Param } from '@nestjs/common';
import { User } from '../auth/entities/user.entity';
import { AssistantInfoService } from './assistant-info.service';
import { AssignAssistantsDto } from './dto/assign-assistants.dto';
import { AssistantInfo } from './entities/assistant-info.entity';
import { Auth } from 'src/auth/decorators';
import { ValidRoles } from 'src/auth/enums';

@Controller('assistant-info')
@Auth(ValidRoles.Admin)
export class AssistantInfoController {
  constructor(private readonly assistantInfoService: AssistantInfoService) {}

  @Patch()
  assignAssistants(@Body() dto: AssignAssistantsDto): Promise<{ message: string }> {
    return this.assistantInfoService.updateAssistants(dto);
  }

  @Get()
  async getAllAssistants(): Promise<User[]> {
    return this.assistantInfoService.findAllAssistants();
  }

  @Get(':medicId')
  findAssistantsByMedic(@Param('medicId') medicId: string): Promise<AssistantInfo[]> {
    return this.assistantInfoService.findAssistantsByMedic(medicId);
  }
}
