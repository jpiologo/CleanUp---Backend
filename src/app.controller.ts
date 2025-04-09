/* eslint-disable @typescript-eslint/no-unused-vars */
import { Controller, Get } from '@nestjs/common'
// biome-ignore lint/style/useImportType: <explanation>
import { AppService } from './app.service'
import { ApiTags } from '@nestjs/swagger'
@ApiTags('Application Status')
@Controller('health')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello()
  }
}
