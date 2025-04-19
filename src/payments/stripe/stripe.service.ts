import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { Stripe } from 'stripe';
import { STRIPE_WEBHOOK_SECRET } from './stripe.constants';

@Injectable()
export class StripeService {
  constructor(
    @Inject('STRIPE_CLIENT') private readonly client: Stripe,
  ) {}

  async createCheckoutSession(
    amount: number,
    currency: string,
    metadata: Record<string, any>,
  ): Promise<Stripe.Checkout.Session> {
    return this.client.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency,
            product_data: { name: 'Cleaning Service' },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      metadata,
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
    });
  }

  async createPaymentIntent(
amount: number, currency: string, applicationFee: number, cleaner: { isActive: boolean; stripeAccountId: string | null; }, destinationAccount: string,
  ): Promise<Stripe.PaymentIntent> {
    return this.client.paymentIntents.create({
      amount,
      currency,
      application_fee_amount: applicationFee,
      transfer_data: { destination: destinationAccount },
      payment_method_types: ['card'],
    });
  }

  constructEvent(payload: Buffer, signature: string): Stripe.Event {
    try {
      return this.client.webhooks.constructEvent(
        payload,
        signature,
        STRIPE_WEBHOOK_SECRET,
      );
    } catch (err) {
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }
  }

  async handleWebhook(event: Stripe.Event) {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        // TODO: fulfill order, update database, split revenue etc.
        break;
      default:
        break;
    }
  }
}
