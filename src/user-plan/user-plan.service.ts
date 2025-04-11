import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserPlanDto } from './dto/user-plan.dto';
import { UpdateUserPlanDto } from './dto/user-plan.dto';

@Injectable()
export class UserPlanService {
  constructor(private prisma: PrismaService) {}

  async checkAndUpdateExpiredPlans() {
    const now = new Date();
    await this.prisma.userPlan.updateMany({
      where: {
        active: true,
        endDate: {
          lt: now,
        },
      },
      data: {
        active: false,
      },
    });
  }

  async getMyPlan(userId: string) {
    return this.prisma.userPlan.findFirst({
      where: {
        userId,
        active: true,
        endDate: {
          gte: new Date(),
        },
      },
      include: { plan: true },
    });
  }

  async getAllPlans() {
    return this.prisma.userPlan.findMany({ include: { user: true, plan: true } });
  }

  async create(dto: CreateUserPlanDto) {
    const existing = await this.prisma.userPlan.findFirst({
      where: {
        userId: dto.userId,
        active: true,
        endDate: { gte: new Date() },
      },
    });

    if (existing) {
      await this.prisma.userPlan.update({
        where: { id: existing.id },
        data: { active: false },
      });
    }

    return this.prisma.userPlan.create({
      data: {
        ...dto,
        active: true,
        usedCleanings: 0,
      },
    });
  }

  async update(dto: UpdateUserPlanDto) {
    const plan = await this.prisma.userPlan.findUnique({ where: { id: dto.id } });
    if (!plan) throw new NotFoundException('User plan not found');

    const isExpired = dto.endDate ? new Date(dto.endDate) < new Date() : false;
    return this.prisma.userPlan.update({
      where: { id: dto.id },
      data: {
        ...dto,
        active: !isExpired,
      },
    });
  }
}