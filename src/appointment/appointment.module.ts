import { Module } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { AppointmentController } from './appointment.controller';

@Module({
  providers: [AppointmentService],
  controllers: [AppointmentController]
})
export class AppointmentModule {}
