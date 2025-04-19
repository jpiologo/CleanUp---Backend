import { Module } from '@nestjs/common';
import { StripeProvider } from './stripe.provider';
import { StripeService } from './stripe.service';

@Module({
  providers: [StripeProvider, StripeService],
  exports: [StripeProvider, StripeService],
})
export class StripeModule {}