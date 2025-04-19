import { IsNumber } from 'class-validator'

export class CreateCheckoutDto {
  @IsNumber()
  amount: number
}

// src/payments/dto/payment-response.dto.ts
export class PaymentResponseDto {
  sessionId: string
}

// src/payments/payments.service.ts
import { Injectable } from '@nestjs/common'
import { StripeService } from '../stripe/stripe.service'

@Injectable()
export class PaymentsService {
  constructor(private readonly stripeService: StripeService) {}

  async createPaymentSession(userId: string, amount: number) {
    const session = await this.stripeService.createCheckoutSession(
      amount,
      'usd',
      { userId },
    )
    return { sessionId: session.id }
  }

}
