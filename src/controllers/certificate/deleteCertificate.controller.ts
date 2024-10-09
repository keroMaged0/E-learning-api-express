import { RequestHandler } from "express";

import { findCertificateById } from "../../services/entities/certificate.service";
import { sendVerifyCode } from "../../services/entities/verifyCode.service";
import { catchError } from "../../middlewares/errorHandling.middleware";
import { findCourseById } from "../../services/entities/course.service";
import { findUserById } from "../../services/entities/user.service";
import { NotFoundError } from "../../errors/notFoundError";
import { VerifyReason } from "../../types/verify-reason";
import { SuccessResponse } from "../../types/response";

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
 * or if the user is unauthorized.
 */
export const deleteCertificateHandler: RequestHandler<
    unknown,
    SuccessResponse
> = catchError(
    async (req, res, next) => {
        const { certificateId } = req.params;
        const { _id } = req.loggedUser

        // Check if the certificate exists
        const certificate = await findCertificateById(certificateId, next);

        // Check if the course exists
        const course = await findCourseById(certificate.courseId, next)

        // Ensure the instructor exists and is authorized to delete the course
        const user = await findUserById(_id, next)
        if (course.instructorId.toString() !== user._id.toString()) {
            return next(new NotFoundError('Unauthorized instructor'));
        }

        // Generate a verification code for the deletion confirmation
        const expireAt = await sendVerifyCode({
            user,
            reason: VerifyReason.deleteCertificate,
            subject: `Verification code to delete your certificate`
        })

        res.status(200).json({
            status: true,
            message: 'Check your email to confirm review deletion',
            data: expireAt,
        });
    }
)

