import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { CardDtos } from './dto/payment.dto';

@Injectable()
export class PaymentService {
  private stripe: Stripe;

  constructor() {
    // Use your live secret key (make sure to keep it secure and never expose it publicly)
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }

  async createPaymentIntent(amount: number) {
    try {
      // Create a PaymentIntent with automatic payment methods enabled
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount, // Amount should be in cents
        currency: 'usd', // Currency code
        payment_method_types: ['card'],
      });
      return paymentIntent;
    } catch (error) {
      // Log the error for debugging
      console.error('Error creating PaymentIntent:', error);

      // Throw a user-friendly error message
      // You can customize the error message based on the error type if needed
      throw new Error('Payment processing error. Please try again later.');
    }
  }
  async retrivePaymentIntent(paymentIntentId: string) {
    try {
      // Create a PaymentIntent with automatic payment methods enabled
      const paymentIntent =
        await this.stripe.paymentIntents.retrieve(paymentIntentId);
      return paymentIntent;
    } catch (error) {
      // Log the error for debugging
      console.error('Error creating PaymentIntent:', error);

      // Throw a user-friendly error message
      // You can customize the error message based on the error type if needed
      throw new Error('Payment processing error. Please try again later.');
    }
  }

  async createCardholder(name: string, email: string, phoneNumber: string) {
    try {
      const cardholder = await this.stripe.customers.create({
        name: name,
        email: email,
        phone: phoneNumber,
      });
      return cardholder;
    } catch (error) {
      console.error('Error creating cardholder:', error);
      throw new Error('Cardholder creation failed');
    }
  }

  // Method to issue a card for the cardholder
  async createCard(
    input: CardDtos.CreateCardInputDto,
    params: CardDtos.CustomerParamsDto,
  ) {
    try {
      const card = await this.stripe.tokens.create({
        card: {
          number: parseInt(input.cardNumber), // Keep as string to match expected type
          exp_month: parseInt(input.expMonth), // Convert month to integer
          exp_year: parseInt(input.expYear), // Convert year to integer
          cvc: parseInt(input.cvc), // Keep as string
        },
      } as any);
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: 5000, // Amount in cents
        currency: 'usd', // Currency of the transaction
        payment_method_data: {
          type: 'card',
          card: {
            token: card.id, // The token ID you received
          },
        },
        confirm: true, // This confirms the payment immediately
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'never', // Disables redirect-based payment methods
        },
      } as any);

      return card;
    } catch (error) {
      console.error('Error creating card token:', error);
      throw new Error('Card creation failed');
    }
  }
}
