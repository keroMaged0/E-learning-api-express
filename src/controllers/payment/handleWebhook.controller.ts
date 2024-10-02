import Stripe from 'stripe';

import { Payment } from '../../models/payment.models';
import { env } from '../../config/env';
import { Enrolled } from '../../models/enrolled.model';


/*************** stripe webhook ***************/
export const handleStripeWebhook = async (request, response) => {
    const sig = request.headers['stripe-signature'];
    if (!sig) {
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
}

/*************** Handle events ***************/
const handleStripeEvent = async (event: Stripe.Event) => {
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
}

/*************** Handle success payment intent ***************/
const handleCheckoutSessionCompleted = async (session: Stripe.Checkout.Session) => {

    if (!session.metadata || !session.metadata.paymentId) {
        console.log('Payment ID is missing in session metadata');
        return;
    }

    const paymentId = session.metadata.paymentId;
    const payment = await Payment.findById(paymentId);
    await Enrolled.create({
        userId: session.metadata.userId,
        courseId: payment?.courseId,
        paymentId: session.metadata.paymentId
    })

    if (!payment) {
        console.log(`Payment not found for paymentId ${paymentId}`);
        return;
    }

    payment.status = 'successful';
    payment.transactionId = session.id;

    await payment.save();
};

/*************** Handle failed payment intent ***************/
const handleFailurePaymentIntent = async (paymentIntent: Stripe.PaymentIntent) => {
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
};