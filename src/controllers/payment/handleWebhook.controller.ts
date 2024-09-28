import Stripe from 'stripe';
import { env } from '../../config/env';
import { Payment } from '../../models/payment.models';
import { EnrolledCourse } from '../../models/EnrolledCourse.models';


export const handleWebhook = async (request, response) => {
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


const handleStripeEvent = async (event: Stripe.Event) => {
    switch (event.type) {
        case 'checkout.session.completed':
            await handleCheckoutSessionCompleted(event.data.object);
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }
}


const handleCheckoutSessionCompleted = async (session: Stripe.Checkout.Session) => {

    if (!session.metadata || !session.metadata.paymentId) {
        console.log('Payment ID is missing in session metadata');
        return;
    }

    const paymentId = session.metadata.paymentId;
    const payment = await Payment.findById(paymentId);
    await EnrolledCourse.create({
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