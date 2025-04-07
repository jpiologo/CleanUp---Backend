/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, NotFoundException } from '@nestjs/common'
// biome-ignore lint/style/useImportType: <explanation>
import { CreatePlanDto } from './dto/create-plan.dto'
// biome-ignore lint/style/useImportType: <explanation>
import { UpdatePlanDto } from './dto/update-plan.dto'
// biome-ignore lint/style/useImportType: <explanation>
import { PrismaService } from 'prisma/prisma.service'
// biome-ignore lint/style/useImportType: <explanation>
import { Plan } from '@prisma/client'

@Injectable()
export class PlanService {
  //database connection
  constructor(private prisma: PrismaService) {}

  async create(createPlanDto: CreatePlanDto): Promise<Plan> {
    return await this.prisma.plan.create({
      data: createPlanDto,
    })
  }

  findAll() {
    return this.prisma.plan.findMany()
  }

  async findOne(id: string): Promise<Plan> {
    const plan = await this.prisma.plan.findUnique({
      where: { id },
    })
    if (!plan) throw new NotFoundException(`Plan with id ${id} not found`)

    return plan
  }

  async update(id: string, updatePlanDto: UpdatePlanDto): Promise<Plan> {
    try {
      const updatedPlan = await this.prisma.plan.update({
        where: { id },
        data: updatePlanDto,
      })
      return updatedPlan
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error.code === 'P2025') {
        throw new NotFoundException(`Plan with id ${id} not found`)
      }
      throw error
    }
  }

  remove(id: number) {
    return `This action removes a #${id} plan`
  }
}
