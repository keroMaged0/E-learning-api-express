import { RequestHandler } from "express";

import { catchError } from "../../middlewares/errorHandling.middleware";
import { SuccessResponse } from "../../types/response";
import { Payment } from "../../models/payment.models";
import { NotFoundError } from "../../errors/notFoundError";
import { EnrolledCorseSchema, EnrolledCourse } from "../../models/EnrolledCourse.models";


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
