import { RequestHandler } from "express";

import { catchError } from "../../middlewares/errorHandling.middleware";
import { SuccessResponse } from "../../types/response";
import { Payment } from "../../models/payment.models";
import { NotFoundError } from "../../errors/notFoundError";

/**
 * Handler function to check the status of a payment.
 * Retrieves payment information based on the provided payment ID.
 * 
 * @param {Request} req - The request object containing the payment ID.
 * @param {Response} res - The response object used to send a response.
 * @param {NextFunction} next - The next middleware function in the stack.
 * @returns {Promise<void>} - A promise that resolves to void.
 * @throws {NotFoundError} - Throws an error if the payment is not found.
 */
export const checkPaymentStatusHandler: RequestHandler<unknown, SuccessResponse> = catchError(
    async (req, res, next) => {
        const { paymentId } = req.params;

        const payment = await Payment.findById(paymentId);
        if (!payment) return next(new NotFoundError('Payment not found'));

        return res.status(200).json({
            status: true,
            message: "Payment status retrieved successfully",
            data: {
                status: payment.status
            },
        });
    }
);
