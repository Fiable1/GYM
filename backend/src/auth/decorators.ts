import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';
import { RoleType } from '../common/constants';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const ROLES_KEY = 'roles';
export const Roles = (...roles: RoleType[] | string[]) => SetMetadata(ROLES_KEY, roles);

export interface AuthUser {
  id: string;
  tenantId?: string;
  email: string;
  role: string;
  firstName: string;
  lastName?: string;
  locationId?: string;
  language?: string;
}

export const CurrentUser = createParamDecorator(
  (data: keyof AuthUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user: AuthUser = request.user;
    return data ? user?.[data] : user;
  },
);