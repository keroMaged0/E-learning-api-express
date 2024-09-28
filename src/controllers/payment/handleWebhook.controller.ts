import Stripe from 'stripe';
import { env } from '../../config/env';
import { Payment } from '../../models/payment.models';


export const handleWebhook = async (request, response) => {
    const sig = request.headers['stripe-signature'];
    if (!sig) {
        return response.status(400).send('Missing Stripe signature');
    }

    let event;

    try {
        event = Stripe.webhooks.constructEvent(
            request.body,
            sig,
            env.stripe.webhookSecret as string
        );
    } catch (err: any) {
        response.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            const data = event.data.object;

            const payment = await Payment.findById(data.metadata.paymentId);
            if (!payment) {
                console.log(`Payment not found for paymentId ${data.metadata.paymentId}`);
                return;
            }

            payment.status = 'successful';
            payment.transactionId = data.id;

            await payment.save();
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    response.send();
}