import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { UserRole } from '@prisma/client'

export interface AuthenticatedUser {
  id: string
  email?: string
  role: UserRole
}

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext): AuthenticatedUser => {
    const request = context.switchToHttp().getRequest<{ user: AuthenticatedUser }>()
    return request.user
  }
)