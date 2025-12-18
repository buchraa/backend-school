// src/auth/fake-auth.guard.ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Role } from './role.enum';

@Injectable()
export class FakeAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    // On lit un header HTTP x-role envoyé depuis Thunder Client
    const roleHeader = request.headers['x-role'] as string | undefined;

    const role =
      roleHeader && Object.values(Role).includes(roleHeader as Role)
        ? (roleHeader as Role)
        : Role.PARENT; // rôle par défaut

    request.user = {
      id: 1,
      email: 'fake@example.com',
      role,
    };

    return true;
  }
}
