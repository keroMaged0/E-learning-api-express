import Stripe from 'stripe';

import handleStripeEvent from './stripe/handleEvent.controller';
import { env } from '../../config/env';
import { logger } from '../../config/logger';


/*************** stripe webhook ***************/
export const handleStripeWebhook = async (request, response) => {
    try {
        const sig = request.headers['stripe-signature'];
        if (!sig) {
            logger.error('Missing Stripe signature');
            return response.status(400).send('Missing Stripe signature');
        }

        let stripeEvent;
        try {
            stripeEvent = Stripe.webhooks.constructEvent(
                request.body,
                sig,
                env.stripe.webhookSecret as string
            );
        } catch (err: any) {
            response.status(400).send(`Webhook Error: ${err.message}`);
            return;
        }

        // Handle the event based on its type
        await handleStripeEvent(stripeEvent);

        // Return a 200 response to acknowledge receipt of the event
        response.send();
    } catch (error) {
        logger.error('Error in handleStripeWebhook', error);
        throw error;
    }
}

