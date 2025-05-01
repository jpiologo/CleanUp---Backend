import { Injectable, Inject, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { PaymentStatus } from '@prisma/client';
import Stripe from 'stripe';

export interface CreateCheckoutDto {
  amount: number;
  currency: string;
  diaristAccountId: string;
  platformFee: number;
  secondRecipientAccountId?: string;
  secondRecipientAmount?: number;
  bookingId: string;
}

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);

  constructor(
    @Inject('STRIPE_CLIENT') private readonly stripe: Stripe,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async createCheckoutSession(dto: CreateCheckoutDto): Promise<Stripe.Checkout.Session> {
    const {
      amount,
      currency,
      diaristAccountId,
      platformFee,
      secondRecipientAccountId,
      secondRecipientAmount,
      bookingId,
    } = dto;

    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    if (!frontendUrl) {
      this.logger.error('FRONTEND_URL is not defined');
      throw new BadRequestException('FRONTEND_URL must be set');
    }

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency,
            product_data: { name: 'Serviço de Limpeza' },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${frontendUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/cancel`,
      payment_intent_data: {
        transfer_data: { destination: diaristAccountId },
        application_fee_amount: Math.round(platformFee * 100),
      },
      metadata: {
        bookingId,
        secondRecipientAccountId: secondRecipientAccountId ?? '',
        secondRecipientAmount: (secondRecipientAmount ?? 0).toString(),
      },
    });

    return session;
  }

  async constructWebhookEvent(payload: Buffer, signature: string, webhookSecret: string): Promise<Stripe.Event> {
    try {
      return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err) {
      this.logger.error(`Failed to construct webhook event: ${err.message}`);
      throw new BadRequestException(`Webhook verification failed: ${err.message}`);
    }
  }

  async handleWebhook(event: Stripe.Event): Promise<void> {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const { bookingId, secondRecipientAccountId, secondRecipientAmount } = session.metadata ?? {};
      const extraAmount = Number(secondRecipientAmount || 0);

      if (!bookingId) {
        this.logger.warn('checkout.session.completed without bookingId in metadata');
        return;
      }

      // 1) Mark the appointment as scheduled
      await this.prisma.appointment.update({
        where: { id: bookingId },
        data: { status: 'SCHEDULED' },
      });

      // 2) Update the payment status to COMPLETED
      await this.prisma.payment.update({
        where: { transactionId: session.id },
        data: { status: PaymentStatus.PAID },
      });

      // 3) If there’s a second recipient, send a transfer
      if (extraAmount > 0 && secondRecipientAccountId) {
        await this.stripe.transfers.create({
          amount: Math.round(extraAmount * 100),
          currency: session.currency!,
          destination: secondRecipientAccountId,
          metadata: { bookingId },
        });
      }

      this.logger.log(`Appointment ${bookingId} updated to SCHEDULED and payment ${session.id} marked as COMPLETED`);
      return;
    }

    this.logger.log(`Unhandled event type: ${event.type}`);
  }
}