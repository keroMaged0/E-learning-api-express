import { RequestHandler } from "express";

import { catchError } from "../../middlewares/errorHandling.middleware";
import { NotFoundError } from "../../errors/notFoundError";
import { SuccessResponse } from "../../types/response";
import { Payment } from "../../models/payment.models";


/**
 * Handler function to get all payments associated with a user.
 * This function checks if the logged-in user is authorized to retrieve the payments,
 * and if so, it fetches and returns the payments for that user.
 * @param {Request} req - The request object containing the userId in parameters.
 * @param {Response} res - The response object used to send a response.
 * @param {NextFunction} next - The next middleware function in the stack.
 * @returns {Promise<void>} - A promise that resolves to void.
 * @throws {NotFoundError} - Throws an error if the user is unauthorized or if no payments are found.
 */
export const getUserPaymentsHandler: RequestHandler<unknown, SuccessResponse> = catchError(
    async (req, res, next) => {
        const { userId } = req.params
        const { _id } = req.loggedUser

        if (!_id.toString() === userId.toString()) {
            return next(new NotFoundError('Unauthorized user'));
        }

        const payments = await Payment.find({ userId });
        if (!payments || payments.length === 0) {
            return next(new NotFoundError('No payments found for this user'));
        }

        return res.status(200).json({
            status: true,
            message: "Payments retrieved successfully",
            data: {
                payments,
            },
        });

    }
);
