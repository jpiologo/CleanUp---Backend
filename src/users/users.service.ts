/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { CreateUserDto } from './dto/create-user.dto'
import * as bcrypt from 'bcrypt'
import { UpdateUsersDto } from './dto/update-user.dto'
import { User } from '@prisma/client'

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    })
  }

  async findOne(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    })
    if (!user) throw new NotFoundException(`User with id ${id} not found`)

    return user
  }

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
        ...rest,
        email,
        password: hashedPassword,
        role: 'CLIENT',
      },
    })

    const { password: _, ...result } = user

    return result
  }

  async update(id: string, updateUsersDto: UpdateUsersDto) {
    try {
      // Separa a senha do resto dos dados
      const { password, ...rest } = updateUsersDto

      // Verifica se o usuário existe
      const user = await this.prisma.user.findUnique({ where: { id } })
      if (!user) throw new NotFoundException('User not found')

      // Prepara os dados para atualização
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      const dataToUpdate: any = { ...rest }

      // Se a senha foi enviada, aplica hash
      if (password) {
        dataToUpdate.password = await bcrypt.hash(password, 10)
      }

      // Atualiza o usuário com os dados processados
      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: dataToUpdate,
      })
      
      const {
        id: _id,
        password: _pass,
        identityDocument: _identity,
        phone: _phone,
        role: _role,
        isActive: _isActive,
        createdAt: _createdAt,
        ...infos
      } = updatedUser

      return infos
    } catch (error) {
      if (error instanceof NotFoundException) throw error
      throw new Error(`Error updating user: ${error.message}`)
    }
  }
}
