import { Body, Controller, Get, Patch, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { LoginDto, RoleDto, UpdatePasswordDto, UserDto } from './dto';
import { Auth, GetUser } from './decorators';
import { ValidRoles } from './interfaces';
import { PaginationDto } from 'src/common/dto/pagination.dtos';

@ApiTags('auth')
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

  @Get('all')
  @Auth(ValidRoles.Admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all users (admin only).' })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.authService.findAll(paginationDto);
  }

  @Get('all-medics')
  @Auth(ValidRoles.Assistant)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all medics (assistant only).' })
  findAllMedics() {
    return this.authService.findAllMedics();
  }

  @Get('all-assistants')
  @Auth(ValidRoles.Medic)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all assistants (medic only).' })
  findAllAssistants() {
    return this.authService.findAllAssistants();
  }

  @Patch('assign-role')
  @Auth(ValidRoles.Admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Assign role to user (admin only).' })
  assignRole(@Body() data: RoleDto) {
    return this.authService.assignRole(data);
  }

  @Patch('toggle-status')
  @Auth(ValidRoles.Admin)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Toggle user status between active/inactive (admin only).',
  })
  toggleStatus(@Body('email') email: string) {
    return this.authService.toggleStatus(email);
  }

  @Patch('update-password')
  @Auth()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user password (authenticated users).' })
  updatePassword(
    @GetUser('id') userId: string,
    @Body() dto: UpdatePasswordDto,
  ) {
    return this.authService.updatePassword(userId, dto);
  }
}
