import { RequestHandler } from "express";

import { catchError } from "../../middlewares/errorHandling.middleware";
import { SuccessResponse } from "../../types/response";
import { Users } from "../../models/user.models";
import { NotFoundError } from "../../errors/notFoundError";
import { Courses } from "../../models/course.models";
import { EnrolledCourse } from "../../models/EnrolledCourse.models";
import { PaymentGateway } from "../../services/payment/PaymentGateway";
import { Payment } from "../../models/payment.models";

export const initiatePaymentHandler: RequestHandler<unknown, SuccessResponse> = catchError(
    async (req, res, next) => {
        const { courseId, paymentMethod } = req.body;
        const { _id } = req.loggedUser;

        const user = await Users.findById(_id);
        if (!user) return next(new NotFoundError('User not found'));
        if (!user.isVerified) return next(new NotFoundError('User is not verified'));

        const course = await Courses.findById(courseId);
        if (!course) return next(new NotFoundError('Course not found'));

        const enrolledCourse = await EnrolledCourse.findOne({ userId: user._id, courseId })
        if (enrolledCourse) return next(new NotFoundError('User already enrolled in this course'));

        const validPaymentMethods = ['stripe', 'paymob'];
        if (!validPaymentMethods.includes(paymentMethod)) {
            return res.status(400).json({ message: "Invalid payment method" });
        }

        const payment = await Payment.create({
            userId: user._id,
            courseId,
            amount: course.price,
            status: 'pending',
            paymentMethod
        });

        if (!payment || !payment._id || !paymentMethod) {
            return res.status(500).json({ message: "Payment creation failed" });
        }

        let paymentUrl;
        try {
            paymentUrl = await PaymentGateway.createPayment({
                amount: payment.amount,
                paymentId: payment._id.toString(),
                userId: user._id.toString(),
                paymentMethod: payment.paymentMethod
            });
        } catch (error: any) {
            return res.status(500).json({ message: error.message });
        }


        return res.status(200).json({
            status: true,
            message: "Payment initiated successfully",
            data: {
                paymentUrl
            },
        });

    }
);
