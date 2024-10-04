import Stripe from "stripe";

import { createEnrolledCourseHandler } from "../../enrolledCourse/createEnrolledCourse.controller";
import { addParticipantHandler } from "../../chat/chatRoom";
import { Payment } from "../../../models/payment.models";
import { logger } from "../../../config/logger";

/*************** Handle success payment intent ***************/
const handleCheckoutSessionCompleted = async (session: Stripe.Checkout.Session) => {
    try {
        if (!session.metadata || !session.metadata.paymentId) {
            logger.error('Payment ID is missing in checkout session metadata');
            return;
        }

        // Get payment Id
        const paymentId = session.metadata.paymentId;

        // Find payment by payment Id
        const payment = await Payment.findById(paymentId);

        const userId = session.metadata.userId;
        const courseId = payment?.courseId

        // Add user to enrolled courses
        await createEnrolledCourseHandler({ courseId, userId, paymentId });

        // Add participant to chat room
        await addParticipantHandler({ courseId, userId });

        if (!payment) {
            console.log(`Payment not found for paymentId ${paymentId}`);
            return;
        }

        payment.status = 'successful';
        payment.transactionId = session.id;

        await payment.save();
    } catch (error) {
        logger.error(error);
        throw error;
    }
};


export default handleCheckoutSessionCompleted;