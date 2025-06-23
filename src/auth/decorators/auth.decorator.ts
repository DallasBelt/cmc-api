import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { RoleProtected } from './role-protected.decorator';
import { UserRoleGuard } from '../guards/user-role.guard';
import { ValidRoles } from '../enums';

export function Auth(...role: ValidRoles[]) {
  return applyDecorators(
    RoleProtected(...role),
    UseGuards(AuthGuard(), UserRoleGuard),
  );
}
