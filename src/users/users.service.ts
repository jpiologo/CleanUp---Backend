import { Injectable, ConflictException } from '@nestjs/common'
// biome-ignore lint/style/useImportType: <explanation>
import { PrismaService } from '../../prisma/prisma.service'
// biome-ignore lint/style/useImportType: <explanation>
import { CreateUserDto } from './dto/create-user.dto'
import * as bcrypt from 'bcrypt'

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const { email, password, ...rest } = createUserDto

    // Checa se o usuário já existe
    const existingUser = await this.prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      throw new ConflictException('User already exists.')
    }

    // Hash na senha
    const hashedPassword = await bcrypt.hash(password, 10)

    // Criando usuário no banco de dados (await é obrigatório aqui)
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        ...rest,
      },
    })

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...result } = user

    return result
  }
}
