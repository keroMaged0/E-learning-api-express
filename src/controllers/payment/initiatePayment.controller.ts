import { RequestHandler } from "express";

import { catchError } from "../../middlewares/errorHandling.middleware";
import { SuccessResponse } from "../../types/response";
import { Users } from "../../models/user.models";
import { NotFoundError } from "../../errors/notFoundError";
import { Courses } from "../../models/course.models";
import { PaymentGateway } from "../../services/PaymentGateway";
import { Payment } from "../../models/payment.models";
import { Enrolled } from "../../models/enrolled.model";

/**
 * Handler function to initiate payment for a course enrollment.
 * Checks user verification, payment status, and course enrollment status
 * before creating a payment record and initiating the payment process.
 * 
 * @param {Request} req - The request object containing courseId and paymentMethod.
 * @param {Response} res - The response object used to send a response.
 * @param {NextFunction} next - The next middleware function in the stack.
 * @returns {Promise<void>} - A promise that resolves to void.
 * @throws {NotFoundError} - Throws an error if the user, course, or payment conditions are not met.
 */
export const initiatePaymentHandler: RequestHandler<unknown, SuccessResponse> = catchError(
    async (req, res, next) => {
        const { courseId, paymentMethod } = req.body;
        const { _id } = req.loggedUser;

        // Check if the user has already made a successful payment for the course
        const paymentExist = await Payment.findOne({ courseId, userId: _id });
        if (paymentExist && paymentExist.status === 'successful') return res.status(400).json({ message: "Payment already processed" });
        if (paymentExist && paymentExist.status === 'pending') return res.status(400).json({ message: "Payment already initiated " });
        if (paymentExist) return res.status(400).json({ message: "Payment already processed" });

        // Verify the user exists and is verified
        const user = await Users.findById(_id);
        if (!user) return next(new NotFoundError('User not found'));
        if (!user.isVerified) return next(new NotFoundError('User is not verified'));

        // Check if the course exists
        const course = await Courses.findById(courseId);
        if (!course) return next(new NotFoundError('Course not found'));

        // Verify if the user is already enrolled in the course
        const enrolledCourse = await Enrolled.findOne({ userId: user._id, courseId });
        if (enrolledCourse) return next(new NotFoundError('User already enrolled in this course'));


        // Validate payment method
        if (paymentMethod !== 'stripe') {
            return res.status(400).json({ message: "Invalid payment method" });
        }

        // Create a payment record
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
                courseName: course.title
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
