import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { CreateUserPlanDto } from './dto/user-plan.dto'
import { UpdateUserPlanDto } from './dto/user-plan.dto'

@Injectable()
export class UserPlanService {
  constructor(private prisma: PrismaService) {}

  async checkAndUpdateExpiredPlans() {
    const now = new Date()
    await this.prisma.userPlan.updateMany({
      where: {
        isActive: true,
        endDate: {
          lt: now,
        },
      },
      data: {
        isActive: false,
      },
    })
  }

  async getMyPlan(userId: string) {
    return this.prisma.userPlan.findFirst({
      where: {
        userId,
        isActive: true,
        endDate: {
          gte: new Date(),
        },
      },
      include: { plan: true },
    })
  }

  async getAllPlans() {
    return this.prisma.userPlan.findMany({
      include: { user: true, plan: true },
    })
  }

  async create(dto: CreateUserPlanDto, userId: string) {
    const existing = await this.prisma.userPlan.findFirst({
      where: {
        userId: userId,
        isActive: true,
        endDate: { gte: new Date() },
      },
    })

    if (existing) {
      await this.prisma.userPlan.update({
        where: { id: existing.id },
        data: { isActive: false },
      })
    }

    const plan = await this.prisma.plan.findUnique({
      where: { id: dto.planId },
    })
    if (!plan) {
      throw new Error('Subscription plan not found')
    }

    const startDate = new Date()
    const endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + plan.daysToExpire)

    return this.prisma.userPlan.create({
      data: {
        ...dto,
        userId,
        usedCleanings: 0,
        cleaningsPerWeek: plan.cleaningsPerWeek,
        startDate,
        endDate,
      },
    })
  }

  async update(dto: UpdateUserPlanDto) {
    const plan = await this.prisma.userPlan.findUnique({
      where: { id: dto.id },
    })
    if (!plan) throw new NotFoundException('User plan not found')

    const endDate = plan.endDate

    const isExpired = endDate ? new Date(endDate) < new Date() : false
    return this.prisma.userPlan.update({
      where: { id: dto.id },
      data: {
        ...dto,
        isActive: !isExpired,
      },
    })
  }
}
