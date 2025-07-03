import { Controller, Patch, Body, Get, Param, Delete } from '@nestjs/common';
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
    return this.assistantInfoService.assignAssistants(dto);
  }

  @Get(':medicId')
  findAssistantsByMedic(@Param('medicId') medicId: string): Promise<AssistantInfo[]> {
    return this.assistantInfoService.findAssistantsByMedic(medicId);
  }

  @Delete(':userId')
  removeAssignment(@Param('userId') userId: string): Promise<{ message: string }> {
    return this.assistantInfoService.removeAssignment(userId);
  }
}
