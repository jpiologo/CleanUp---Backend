import { Module } from '@nestjs/common';
import { CleaningTypeService } from './cleaning-type.service';
import { CleaningTypeController } from './cleaning-type.controller';

@Module({
  providers: [CleaningTypeService],
  controllers: [CleaningTypeController]
})
export class CleaningTypeModule {}
