import { Controller, Post, Req, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StripeService } from './stripe.service';
import { Request } from 'express';

@Controller('stripe')
export class StripeController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly configService: ConfigService,
  ) {}

  @Post('webhook')
  async handleWebhook(@Req() request: Request) {
    const sig = request.headers['stripe-signature'] as string;
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      throw new BadRequestException('STRIPE_WEBHOOK_SECRET is not defined');
    }

    const rawBody = (request as any).rawBody as Buffer;
    if (!rawBody) {
      throw new BadRequestException('Raw body is missing');
    }

    try {
      const event = await this.stripeService.constructWebhookEvent(
        rawBody,
        sig,
        webhookSecret,
      );
      await this.stripeService.handleWebhook(event);
      return { received: true };
    } catch (err) {
      return { statusCode: 400, message: `Webhook Error: ${err.message}` };
    }
  }
}