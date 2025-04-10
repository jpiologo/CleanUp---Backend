// src/appointments/appointments.controller.ts
import {
    Controller,
    Post,
    Get,
    Patch,
    Param,
    Body,
    Request,
    UseGuards,
  } from '@nestjs/common'
  import {
    ApiTags,
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
  } from '@nestjs/swagger'
  import { AppointmentService } from './appointment.service'
  import { CreateAppointmentDto } from './dto/create-appointment.dto'
  import { UpdateAppointmentDto } from './dto/update-appointment.dto'
  import { AuthGuard } from '@nestjs/passport'
  import { Appointment } from '@prisma/client'
  
  @ApiTags('Appointments')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Controller('appointments')
  export class AppointmentController {
    constructor(private readonly service: AppointmentService) {}

    @Get()
    @ApiOperation({ summary: 'Listar agendamentos do usuário logado' })
    @ApiResponse({ status: 200, description: 'Lista retornada com sucesso' })
    findAll(@Request() req: { user: { id: string } }) {
      return this.service.findAllByUser(req.user.id)
    }
  
    @Post()
    @ApiOperation({ summary: 'Criar um novo agendamento' })
    @ApiResponse({ status: 201, description: 'Agendamento criado com sucesso' })
    @ApiResponse({ status: 400, description: 'Endereço inválido' })
    create(
      @Request() req: { user: { id: string } },
      @Body() dto: CreateAppointmentDto,
    ): Promise<Appointment> {
      return this.service.create(req.user.id, dto)
    }
  
    @Patch(':id')
    @ApiOperation({ summary: 'Atualizar agendamento do usuário logado' })
    @ApiResponse({ status: 200, description: 'Agendamento atualizado com sucesso' })
    update(
      @Param('id') id: string,
      @Request() req: { user: { id: string } },
      @Body() dto: UpdateAppointmentDto,
    ) {
      return this.service.update(id, req.user.id, dto)
    }
  }
  