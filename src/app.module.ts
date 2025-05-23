import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'

import { AppController } from './app.controller'
import { AppService } from './app.service'

import { PrismaModule } from '../prisma/prisma.module'
import { UsersModule } from './users/users.module'
import { PlanModule } from './plan/plan.module'
import { AuthModule } from './auth/auth.module'
import { AppointmentModule } from './appointment/appointment.module'
import { AddressModule } from './address/address.module'

import { JwtAuthGuard } from './common/guards/jwt-auth.guard'
import { CleaningTypeModule } from './cleaning-type/cleaning-type.module'
import { UserPlanModule } from './user-plan/user-plan.module'
import { CleanerProfileModule } from './cleaner-profile/cleaner-profile.module'
import { NotificationsModule } from './notifications/notifications.module'
import { ReviewModule } from './review/review.module'
import { StripeModule } from './stripe/stripe.module'
import { validate } from 'class-validator'
import * as Joi from 'joi';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        DATABASE_URL: Joi.string().uri().required(),
        FRONTEND_URL: Joi.string().uri().required(),
        // … outras vars que você quiser validar
      }),
      validationOptions: {
        abortEarly: false,
      },
    }),
    PlanModule,
    AuthModule,
    AppointmentModule,
    AddressModule,
    CleaningTypeModule,
    UserPlanModule,
    CleanerProfileModule,
    NotificationsModule,
    ReviewModule,
    StripeModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
