import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { CardDtos } from './dto/payment.dto';

@Injectable()
export class PaymentService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }

  // Basic payment intent creation
  async createBasicPaymentIntent(amount: number) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount, // Amount should be in cents
        currency: 'usd', // Currency code
        payment_method_types: ['card'],
      });
      return paymentIntent;
    } catch (error) {
      console.error('Error creating PaymentIntent:', error);
      throw new Error('Payment processing error. Please try again later.');
    }
  }

  async retrievePaymentIntent(paymentIntentId: string) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      return paymentIntent;
    } catch (error) {
      console.error('Error retrieving PaymentIntent:', error);
      throw new Error('Payment processing error. Please try again later.');
    }
  }

  async createCardholder(name: string, email: string, phoneNumber: string) {
    try {
      const cardholder = await this.stripe.customers.create({
        name,
        email,
        phone: phoneNumber,
      });
      return cardholder;
    } catch (error) {
      console.error('Error creating cardholder:', error);
      throw new Error('Cardholder creation failed');
    }
  }

  async createCardToken(input: CardDtos.CreateCardInputDto) {
    try {
      const cardToken = await this.stripe.tokens.create({
        card: {
          number: input.cardNumber,
          exp_month: parseInt(input.expMonth),
          exp_year: parseInt(input.expYear),
          cvc: input.cvc,
        },
      } as any);
      return cardToken;
    } catch (error) {
      console.error('Error creating card token:', error);
      throw new Error('Card token creation failed');
    }
  }

  async createPaymentIntent(amount: number, currency: string, cardTokenId: string) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: amount, // Amount in cents
        currency,
        payment_method_data: {
          type: 'card',
          card: {
            token: cardTokenId,
          },
        },
        confirm: true,
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'never',
        },
      } as any);
      return paymentIntent;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw new Error('Payment intent creation failed');
    }
  }

  async createCard(input: CardDtos.CreateCardInputDto) {
    try {
      const cardToken = await this.createCardToken(input);
      const paymentIntent = await this.createPaymentIntent(
        Math.round(input.price * 100), // Convert to cents
        'usd', // Currency
        cardToken.id // Card token ID
      );
       return paymentIntent;
    } catch (error) {
      throw new Error('Card creation or payment processing failed');
    }
  }
}
