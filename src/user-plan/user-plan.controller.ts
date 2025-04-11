import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { UserPlanService } from './user-plan.service';
import { CreateUserPlanDto } from './dto/user-plan.dto';
import { UpdateUserPlanDto } from './dto/user-plan.dto';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import { Roles } from 'src/common/decorators/roles.decorator';

@ApiTags('User Plans')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('user-plans')
export class UserPlanController {
  constructor(private readonly service: UserPlanService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get the plan of the logged-in user' })
  @ApiResponse({ status: 200, description: 'Returns the active user plan if exists' })
  async getMyPlan(@CurrentUser() user: { id: string }) {
    await this.service.checkAndUpdateExpiredPlans();
    return this.service.getMyPlan(user.id);
  }

  @Roles(UserRole.ADMIN)
  @Get()
  @ApiOperation({ summary: 'Get all user plans (admin only)' })
  @ApiResponse({ status: 200, description: 'List of all user plans' })
  async getAllPlans() {
    await this.service.checkAndUpdateExpiredPlans();
    return this.service.getAllPlans();
  }

  @Post()
  @ApiOperation({ summary: 'Create a user plan after successful payment' })
  @ApiResponse({ status: 201, description: 'User plan created successfully' })
  create(@Body() dto: CreateUserPlanDto) {
    return this.service.create(dto);
  }

  @Patch()
  @ApiOperation({ summary: 'Update user plan if a new one is purchased' })
  @ApiResponse({ status: 200, description: 'User plan updated successfully' })
  update(@Body() dto: UpdateUserPlanDto) {
    return this.service.update(dto);
  }
}