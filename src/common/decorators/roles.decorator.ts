import { SetMetadata } from '@nestjs/common';

export const REQUIRED_ROLES = 'requiredRoles';

export const RequiredRoles = (...roles: string[]) =>
  SetMetadata(REQUIRED_ROLES, roles);
