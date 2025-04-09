import { Module } from '@nestjs/common'
import { AppointmentService } from './appointment.service'
import { AppointmentController } from './appointment.controller'
import { PrismaService } from '../../prisma/prisma.service'
import { JwtStrategy } from '../auth/jwt.strategy'

@Module({
  controllers: [AppointmentController],
  providers: [AppointmentService, PrismaService, JwtStrategy],
})
export class AppointmentModule {}