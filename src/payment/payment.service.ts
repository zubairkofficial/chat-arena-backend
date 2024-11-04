import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';


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
            const paymentIntent = await this.stripe.paymentIntents.retrieve(
               paymentIntentId
              );
            return paymentIntent; 
        } catch (error) {
            // Log the error for debugging
            console.error('Error creating PaymentIntent:', error);

            // Throw a user-friendly error message
            // You can customize the error message based on the error type if needed
            throw new Error('Payment processing error. Please try again later.');
        }
    }
}

// import { Injectable } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Stripe } from 'stripe';
// import { Payment } from './payment.entity';
// import { PaymentRepository } from './payment.repository';

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// @Injectable()
// export class PaymentService {
//     constructor(
//         @InjectRepository(Payment)
//         private paymentRepository:PaymentRepository,
        
       
//     ) {}

//     async createCard(userId: string, cardData) {
//         const { card_number, exp_month, exp_year, cvc } = cardData;

//         if (!card_number || !exp_month || !exp_year || !cvc) {
//             throw new Error('Missing required card information');
//         }

//         const token = await stripe.tokens.create({
//             card: {
//                 number: card_number,
//                 exp_month: exp_month,
//                 exp_year: exp_year,
//                 cvc: cvc,
//             },
//         });

//         const source = await stripe.customers.createSource(userId, {
//             source: token.id,
//         });

//         // Update or create payment record
//         let payment = await this.paymentRepository.findOne({ where: { cardId: userId } });
//         if (payment) {
//             payment.cardId = source.id;
//             payment.tokCard = token.id;
//             await this.paymentRepository.save(payment);
//         } else {
//             const payment = this.paymentRepository.create({
//                 cusId: userId, // Ensure the casing matches your entity definition
//                 cardId: source.id, // Ensure the casing matches your entity definition
//                 tokCard: token.id, // Ensure the casing matches your entity definition
//             });
//             await this.paymentRepository.save(payment);
//         }

//         // Update user to indicate a card has been created
//         // await this.userRepository.update(userId, { cardCreated: true });

//         return source;
//     }

//     async retrieveCard(customerId: string, cardId: string) {
//         return await stripe.customers.retrieveSource(customerId, cardId);
//     }

//     async updateCard(customerId: string, cardId: string, addressCity: string) {
//         return await stripe.customers.updateSource(customerId, cardId, {
//             address_city: addressCity,
//         });
//     }

//     async deleteCard(customerId: string) {
//         return await stripe.customers.del(customerId);
//     }
// }
