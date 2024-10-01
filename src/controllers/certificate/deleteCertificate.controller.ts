import { RequestHandler } from "express";

import { catchError } from "../../middlewares/errorHandling.middleware";
import { Certificate } from "../../models/certificate.models";
import { NotFoundError } from "../../errors/notFoundError";
import { VerifyReason } from "../../types/verify-reason";
import { SuccessResponse } from "../../types/response";
import { Courses } from "../../models/course.models";
import { mailTransporter } from "../../utils/mail";
import { generateCode } from "../../utils/random";
import { Users } from "../../models/user.models";
import { hashCode } from "../../utils/crypto";

/**
 * Handler to initiate the deletion of a certificate.
 *
 * This handler verifies if the certificate exists, checks if the user is authorized to delete it,
 * and sends a verification code to the user's email for confirmation.
 *
 * @param {Request} req - The request object containing the certificate ID in the route parameters.
 * @param {Response} res - The response object used to send the success message.
 * @param {NextFunction} next - The next middleware function to call in case of an error.
 *
 * @returns {Promise<void>} - A promise that resolves to void.
 *
 * @throws {NotFoundError} - Throws an error if the certificate, course, or user is not found, 
 *                           or if the user is unauthorized.
 */
export const deleteCertificateHandler: RequestHandler<
    unknown,
    SuccessResponse
> = catchError(
    async (req, res, next) => {
        const { certificateId } = req.params;
        const { _id } = req.loggedUser

        const certificate = await Certificate.findById(certificateId);
        if (!certificate) return next(new NotFoundError('Certificate not found'));

        const course = await Courses.findById(certificate.courseId);
        if (!course) return next(new NotFoundError('Course not found'));

        const user = await Users.findById(_id);
        if (!user) return next(new NotFoundError('User not found'));

        // Check if the user is authorized (instructor of the course)
        if (course.instructorId.toString() !== user._id.toString()) {
            return next(new NotFoundError('Unauthorized instructor'));
        }

        // Generate a verification code for the deletion confirmation
        const code = generateCode();
        user.verificationCode = {
            code: hashCode(code),
            expireAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes expiration
            reason: VerifyReason.deleteCertificate,
            tempEmail: null,
        };

        // Send the verification code via email to the user
        await mailTransporter.sendMail({
            to: user.email,
            subject: `Verification code to delete your certificate`,
            html: `Verification code: <strong>${code}</strong>`,
        });

        await user.save();

        res.status(200).json({
            status: true,
            message: 'Check your email to confirm review deletion',
            data: null,
        });


    }
)

