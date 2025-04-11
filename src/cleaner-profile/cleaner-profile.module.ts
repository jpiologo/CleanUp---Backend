import { Module } from '@nestjs/common';
import { CleanerProfileService } from './cleaner-profile.service';
import { CleanerProfileController } from './cleaner-profile.controller';

@Module({
  providers: [CleanerProfileService],
  controllers: [CleanerProfileController]
})
export class CleanerProfileModule {}
