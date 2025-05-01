import { Module } from '@nestjs/common'
import { AppointmentsService } from './appointment.service'
import { AppointmentController } from './appointment.controller'
import { PrismaService } from '../../prisma/prisma.service'
import { JwtStrategy } from '../auth/jwt.strategy'
import { PrismaModule } from 'prisma/prisma.module'
import { StripeModule } from 'src/stripe/stripe.module'

@Module({
  imports: [
    PrismaModule,
    StripeModule
  ],
  controllers: [AppointmentController],
  providers: [AppointmentsService, PrismaService, JwtStrategy],
})
export class AppointmentModule {}