import Stripe from 'stripe';
import { env } from '../../config/env';
import { logger } from '../../config/logger';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export class StripePayment {
    static async createPayment({ amount, paymentId, userId }) {
        try {
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [
                    {
                        price_data: {
                            currency: 'EGP',
                            unit_amount: amount * 100,
                            product_data: {
                                name: 'Course Payment',
                            },
                        },
                        quantity: 1,
                    },
                ],
                mode: 'payment',
                success_url: `${env.frontUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${env.frontUrl}/cancel`,
                metadata: {
                    paymentId: paymentId,
                    userId: userId,
                },

            });

            return {
                sessionId: session,
            };
        } catch (error: any) {
            logger.error(error.message);
            throw new Error('Failed to create payment');
        }
    }

}
