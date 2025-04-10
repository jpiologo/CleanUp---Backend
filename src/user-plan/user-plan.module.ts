import { Module } from '@nestjs/common';
import { UserPlanService } from './user-plan.service';
import { UserPlanController } from './user-plan.controller';

@Module({
  providers: [UserPlanService],
  controllers: [UserPlanController]
})
export class UserPlanModule {}
