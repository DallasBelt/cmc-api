import { SetMetadata } from '@nestjs/common';

import { ValidRoles } from '../enums';

export const META_ROLES = 'roles';

export const RoleProtected = (...roles: ValidRoles[]) => {
  return SetMetadata(META_ROLES, roles);
};
