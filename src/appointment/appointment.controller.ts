// src/appointments/appointments.controller.ts
import {
  Controller,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common'
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger'
import { AppointmentService } from './appointment.service'
import { CreateAppointmentDto } from './dto/appointment.dto'
import { AuthGuard } from '@nestjs/passport'
import { CurrentUser } from 'src/common/decorators/current-user.decorator'
import { UserRole } from '@prisma/client'
import { Roles } from 'src/common/decorators/roles.decorator'
  
@ApiTags('Appointments')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('appointments')
export class AppointmentController {
  constructor(private readonly service: AppointmentService) {}
  
  @Roles(UserRole.CLIENT, UserRole.CLEANER, UserRole.ADMIN)
  @Post()
  @ApiOperation({
    summary: 'Create a new appointment',
    description: `
      Creates a new appointment for the authenticated user. 
      The request must include appointment details such as date, time, and location.
      The user must be authenticated, and the appointment will be associated with their user ID.
      Returns the created appointment details upon success.
    `,
  })
  @ApiResponse({
    status: 201,
    description: 'Appointment successfully created.',
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      userId: '456e7890-e89b-12d3-a456-426614174001',
      location: '21th Street 1111, New York, NY',
      date: '2025-02-21T09:00:00.000Z',
      status: 'SCHEDULED',
      createdAt: '2025-01-10T12:00:00.000Z',
    },
  })
  async create(@CurrentUser() user: { id: string }, @Body() dto: CreateAppointmentDto,) {
    return this.service.create(dto, user.id);
  }
}
  