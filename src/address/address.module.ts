import { Module } from '@nestjs/common'
import { AddressController } from './address.controller'
import { AddressService } from './address.service'
import { PrismaService } from '../../prisma/prisma.service'
import { JwtStrategy } from '../auth/jwt.strategy'

@Module({
  controllers: [AddressController],
  providers: [AddressService, PrismaService, JwtStrategy],
})
export class AddressModule {}