import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RequestWithUser } from './interfaces/request-with-user.interface';

import { AuthService } from './auth.service';
import { LoginDto, RoleDto, UserDto } from './dto';
import { Auth } from './decorators';
import { ValidRoles } from './interfaces';
import { PaginationDto } from 'src/common/dto/pagination.dtos';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register new user.' })
  createUser(@Body() createUserDto: UserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user.' })
  loginUser(@Body() loginUserDto: LoginDto) {
    return this.authService.login(loginUserDto);
  }

  @Patch('complete-profile')
  @Auth(ValidRoles.medic, ValidRoles.assistant)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark profile completion.' })
  completeProfile(@Req() req: RequestWithUser) {
    const userId = req.user.id;
    return this.authService.completeProfile(userId);
  }

  @Get('all')
  @Auth(ValidRoles.admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all users (admin only).' })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.authService.findAll(paginationDto);
  }

  @Get('all-medics')
  @Auth(ValidRoles.assistant)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all medics (assistant only).' })
  findAllMedics() {
    return this.authService.findAllMedics();
  }

  @Get('all-assistants')
  @Auth(ValidRoles.medic)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all assistants (medic only).' })
  findAllAssistants() {
    return this.authService.findAllAssistants();
  }

  @Patch('change-role')
  @Auth(ValidRoles.admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change user role (admin only).' })
  changeRole(@Body() data: RoleDto) {
    return this.authService.changeRole(data);
  }

  @Patch('soft-delete')
  @Auth(ValidRoles.admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle user active status (admin only).' })
  softDeleteUserByEmail(@Body('email') email: string) {
    return this.authService.softDelete(email);
  }

  @Delete(':id')
  @Auth(ValidRoles.admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete user (admin only).' })
  removeUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.authService.remove(id);
  }
}
