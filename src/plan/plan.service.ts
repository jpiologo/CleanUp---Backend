import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common'
import { CreatePlanDto } from './dto/create-plan.dto'
import { UpdatePlanDto } from './dto/update-plan.dto'
import { PrismaService } from 'prisma/prisma.service'
import { Plan } from '@prisma/client'

@Injectable()
export class PlanService {
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
    const existingPlan = await this.prisma.plan.findUnique({
      where: { id },
    })
    if (!existingPlan)
      throw new NotFoundException(`Plan with id ${id} not found`)
    const updatedPlan = await this.prisma.plan.update({
      where: { id },
      data: updatePlanDto,
    })
    return updatedPlan
  }

  async remove(id: string): Promise<string> {
    try {
      const plan = await this.prisma.plan.findUnique({
        where: { id },
      })

      if (!plan) throw new NotFoundException(`Plan with id ${id} not found`)

      await this.prisma.plan.delete({
        where: { id },
      })

      return `Plan with id ${id} deleted successfully`
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }
      throw new InternalServerErrorException('Error deleting plan')
    }
  }
}
