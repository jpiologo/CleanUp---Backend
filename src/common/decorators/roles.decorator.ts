import { SetMetadata } from '@nestjs/common'
// biome-ignore lint/style/useImportType: <explanation>
import { UserRole } from '@prisma/client'

export const ROLES_KEY = 'roles'

export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles)