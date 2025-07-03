import { Controller, Post, Patch, Body, Get, Param, Delete } from '@nestjs/common';
import { AssistantInfoService } from './assistant-info.service';
import { AssignAssistantDto } from './dto/assign-assistant.dto';
import { AssistantInfo } from './entities/assistant-info.entity';
import { Auth } from 'src/auth/decorators';
import { ValidRoles } from 'src/auth/enums';

@Controller('assistant-info')
@Auth(ValidRoles.Admin)
export class AssistantInfoController {
  constructor(private readonly assistantInfoService: AssistantInfoService) {}

  @Patch()
  assignOrReassignAssistant(@Body() dto: AssignAssistantDto): Promise<{ message: string }> {
    return this.assistantInfoService.assignAssistant(dto);
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
