import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PlanService } from './plan.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Subscription Plans') // Nome da categoria no Swagger
@Controller('plans')
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  @Get()
  @ApiOperation({ summary: 'Get all plans or a specific plan by ID' })
  @ApiQuery({ name: 'id', required: false, description: 'Plan Id (optional)' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Invalid ID' })
  @ApiResponse({ status: 404, description: 'Plan not found if ID provided' })
  findAllOrOne(@Query('id') id?: string) { // id é opcional
    if (id) {
      
      return this.planService.findOne(id);
    }
    
    return this.planService.findAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Roles(UserRole.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Register a new plan' })
  @ApiResponse({ status: 201, description: 'Plan created' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  create(@Body() createPlanDto: CreatePlanDto) {
    return this.planService.create(createPlanDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a plan by ID' })
  @ApiResponse({ status: 200, description: 'Plan updated' })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  update(@Param('id') id: string, @Body() updatePlanDto: UpdatePlanDto) {
    return this.planService.update(id, updatePlanDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a plan by ID' })
  @ApiResponse({ status: 200, description: 'Plan deleted' })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  remove(@Param('id') id: string) {
    return this.planService.remove(id);
  }
}