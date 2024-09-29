import Stripe from 'stripe';

import { logger } from '../config/logger';
import { env } from '../config/env';

// Initialize Stripe with the secret key from environment variables
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export class PaymentGateway {
    static async createPayment({ amount, paymentId, userId, courseName }) {
        try {
            // Create a new checkout session with Stripe
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [
                    {
                        price_data: {
                            currency: 'EGP',
                            unit_amount: amount * 100, // Convert amount to the smallest currency unit
                            product_data: {
                                name: courseName,
                            },
                        },
                        quantity: 1,
                    },
                ],
                mode: 'payment', 
                success_url: `${env.frontUrl}/success?session_id={CHECKOUT_SESSION_ID}`, // URL to redirect after a successful payment
                cancel_url: `${env.frontUrl}/cancel`, // URL to redirect if payment is canceled
                // Include metadata to identify the payment
                metadata: {
                    paymentId: paymentId, 
                    userId: userId, 
                },
            });

            // Return the session ID
            return {
                sessionId: session.id, 
            };
        } catch (error: any) {
            logger.error(error.message);
            throw new Error('Failed to create payment'); 
        }
    }
}
