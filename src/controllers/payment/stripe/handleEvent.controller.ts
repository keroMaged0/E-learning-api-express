import Stripe from "stripe";

import handleCheckoutSessionCompleted from "./handleCheckoutSessionCompleted.controller";
import handleFailurePaymentIntent from "./handleFailureChecoutSession.controller";
import { logger } from "../../../config/logger";

/*************** Handle Stripe events ***************/
const handleStripeEvent = async (event: Stripe.Event) => {
    try {
        switch (event.type) {
            case 'checkout.session.completed':
                await handleCheckoutSessionCompleted(event.data.object);
                break;
            case 'payment_intent.payment_failed':
                await handleFailurePaymentIntent(event.data.object);
                break;
            default:
                console.log(`Unhandled event type ${event.type}`);
        }
    } catch (error) {
        logger.error(error);
        throw error;
    }
}


export default handleStripeEvent;