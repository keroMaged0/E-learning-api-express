import { RequestHandler } from "express";

import { catchError } from "../../middlewares/errorHandling.middleware";
import { SuccessResponse } from "../../types/response";
import { Payment } from "../../models/payment.models";
import { NotFoundError } from "../../errors/notFoundError";


export const checkPaymentStatusHandler: RequestHandler<unknown, SuccessResponse> = catchError(
    async (req, res, next) => {
        const { paymentId } = req.params;

        const payment = await Payment.findById(paymentId);
        if (!payment) return next(new NotFoundError('Payment not found'));

        let paymentStatus;
        try {
        
        } catch (error: any) {
            return res.status(500).json({ message: error.message });
        }

        return res.status(200).json({
            status: true,
            message: "Payment status retrieved successfully",
            data: {
                paymentId: payment._id,
                status: paymentStatus,
            },
        });
    }
);
