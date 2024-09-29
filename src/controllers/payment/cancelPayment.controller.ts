import { RequestHandler } from "express";

import { catchError } from "../../middlewares/errorHandling.middleware";
import { NotFoundError } from "../../errors/notFoundError";
import { SuccessResponse } from "../../types/response";
import { Payment } from "../../models/payment.models";


/**
 * Handler function to cancel a pending payment.
 * This function checks for the existence of the payment, verifies the user's ownership,
 * and cancels the payment if it is in a pending state.
 * @param {Request} req - The request object containing the paymentId in parameters.
 * @param {Response} res - The response object used to send a response.
 * @param {NextFunction} next - The next middleware function in the stack.
 * @returns {Promise<void>} - A promise that resolves to void.
 * @throws {NotFoundError} - Throws an error if the payment is not found or does not belong to the user.
 */
export const cancelPaymentHandler: RequestHandler<unknown, SuccessResponse> = catchError(
    async (req, res, next) => {
        const { paymentId } = req.params;
        const { _id } = req.loggedUser

        const payment = await Payment.findById(paymentId);
        if (!payment) return next(new NotFoundError('Payment not found'));
        if (payment.userId.toString() !== _id.toString()) return next(new NotFoundError('Payment not found'));

        // Check if the payment status is 'pending'
        if (payment.status !== 'pending') {
            return res.status(400).json({ message: "Only pending payments can be cancelled" });
        }

        payment.status = 'cancelled';
        await payment.save();

        return res.status(200).json({
            status: true,
            message: "Payment cancelled successfully",
        });

    }
);
