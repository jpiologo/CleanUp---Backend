import { Stripe } from 'stripe';
import { STRIPE_SECRET_KEY } from './stripe.constants';

export const StripeProvider = {
  provide: 'STRIPE_CLIENT',
  useFactory: () => {
    return new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2025-03-31.basil',
    });
  },
};