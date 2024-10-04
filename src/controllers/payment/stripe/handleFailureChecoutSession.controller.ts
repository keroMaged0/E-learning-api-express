import Stripe from "stripe";

import { Payment } from "../../../models/payment.models";
import { logger } from "../../../config/logger";

/*************** Handle failed payment intent ***************/
const handleFailurePaymentIntent = async (paymentIntent: Stripe.PaymentIntent) => {
    try {
        if (!paymentIntent.metadata || !paymentIntent.metadata.paymentId) {
            console.log('Payment ID is missing in payment intent metadata');
            return;
        }

        const paymentId = paymentIntent.metadata.paymentId;
        const payment = await Payment.findById(paymentId);
        if (!payment) {
            console.log(`Payment not found for paymentId ${paymentId}`);
            return;
        }

        payment.status = 'failed';
        await payment.save();
    } catch (error) {
        logger.error(error);
        throw error;
    }
};

export default handleFailurePaymentIntent;