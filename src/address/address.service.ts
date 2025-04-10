import {
  Injectable,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto'

@Injectable()
export class AddressService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.address.findMany({ where: { userId } })
  }

  async findOne(id: string, userId: string) {
    const address = await this.prisma.address.findUnique({ where: { id } })
    if (!address || address.userId !== userId) throw new ForbiddenException()
    return address
  }

  async create(dto: CreateAddressDto, userId: string) {
    const existing = await this.prisma.address.count({ where: { userId } })
    if (existing >= 5) {
      throw new BadRequestException('Maximum number of addresses reached.')
    }

    if (dto.isPrimary) {
      await this.prisma.address.updateMany({
        where: { userId },
        data: { isPrimary: false },
      })
    }

    return this.prisma.address.create({
      data: {
        ...dto,
        userId,
      },
    })
  }

  async update(id: string, dto: UpdateAddressDto, userId: string) {
    const address = await this.prisma.address.findUnique({ where: { id } })
    if (!address || address.userId !== userId) throw new ForbiddenException()

    if (dto.isPrimary) {
      await this.prisma.address.updateMany({
        where: { userId },
        data: { isPrimary: false },
      })
    }

    return this.prisma.address.update({ where: { id }, data: dto })
  }

  async remove(id: string, userId: string) {
    const address = await this.prisma.address.findUnique({ where: { id } })
    if (!address || address.userId !== userId) throw new ForbiddenException()
    return this.prisma.address.delete({ where: { id } })
  }
}
