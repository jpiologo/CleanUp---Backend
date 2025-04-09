// biome-ignore lint/style/useImportType: <explanation>
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
// biome-ignore lint/style/useImportType: <explanation>
import { Reflector } from '@nestjs/core'
import { ROLES_KEY } from '../decorators/roles.decorator'
// biome-ignore lint/style/useImportType: <explanation>
import { UserRole } from '@prisma/client'

interface RequestUser {
  role: UserRole
}

interface AuthenticatedRequest extends Request {
  user: RequestUser
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    )

    if (!requiredRoles || requiredRoles.length === 0) {
      return true
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>()
    const { user } = request

    return requiredRoles.includes(user.role)
  }
}
