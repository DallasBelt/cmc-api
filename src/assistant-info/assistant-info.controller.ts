import { Controller, Patch, Body, Get, Param } from '@nestjs/common';
import { User } from '../auth/entities/user.entity';
import { AssistantInfo } from './entities/assistant-info.entity';
import { AssignAssistantsDto } from './dto/assign-assistants.dto';
import { AssistantInfoService } from './assistant-info.service';
import { Auth } from 'src/auth/decorators';
import { ValidRoles } from 'src/auth/enums';
import { Response } from 'src/common/interfaces/response.interface';

@Controller('assistants')
@Auth(ValidRoles.Admin)
export class AssistantInfoController {
  constructor(private readonly assistantInfoService: AssistantInfoService) {}

  @Get()
  async findAllAssistants(): Promise<{ id: string; email: string; medicId: string | null }[]> {
    return this.assistantInfoService.findAllAssistants();
  }

  @Get('assigned/:medicId')
  findAssistantsByMedic(@Param('medicId') medicId: string): Promise<AssistantInfo[]> {
    return this.assistantInfoService.findAssistantsByMedic(medicId);
  }

  @Get('available')
  async findAvailableAssistants(): Promise<User[]> {
    return this.assistantInfoService.findAvailableAssistants();
  }

  @Patch()
  updateAssistants(@Body() dto: AssignAssistantsDto): Promise<Response> {
    return this.assistantInfoService.updateAssistants(dto);
  }
}
