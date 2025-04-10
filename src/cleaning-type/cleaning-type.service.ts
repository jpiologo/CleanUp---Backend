import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCleaningTypeDto } from './dto/cleaning-type.dto';
import { UpdateCleaningTypeDto } from './dto/cleaning-type.dto';

@Injectable()
export class CleaningTypeService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.cleaningType.findMany();
  }

  async create(dto: CreateCleaningTypeDto) {
    return this.prisma.cleaningType.create({ data: dto });
  }

  async update(id: string, dto: UpdateCleaningTypeDto) {
    const exists = await this.prisma.cleaningType.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Cleaning type not found');

    return this.prisma.cleaningType.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    const exists = await this.prisma.cleaningType.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Cleaning type not found');

    return this.prisma.cleaningType.delete({ where: { id } });
  }
}