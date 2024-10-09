import { RequestHandler } from "express";

import { findCertificateById } from "../../services/entities/certificate.service";
import { clearVerifyCode } from "../../services/entities/verifyCode.service";
import { catchError } from "../../middlewares/errorHandling.middleware";
import { findCourseById } from "../../services/entities/course.service";
import { findUserById } from "../../services/entities/user.service";
import { NotAllowedError } from "../../errors/notAllowedError";
import { NotFoundError } from "../../errors/notFoundError";
import { VerifyReason } from "../../types/verify-reason";
import { SuccessResponse } from "../../types/response";


/**
 * Handler to confirm the deletion of a certificate.
 *
 * This handler checks if the certificate and course exist, 
 * verifies if the user is authorized to delete the certificate, 
 * and confirms the deletion process using a verification code.
 *
 * @param {Request} req - The request object containing the certificate ID in the route parameters.
 * @param {Response} res - The response object used to send the success message.
 * @param {NextFunction} next - The next middleware function to call in case of an error.
 *
 * @returns {Promise<void>} - A promise that resolves to void.
 *
 * @throws {NotFoundError} - Throws an error if the certificate, course, or user is not found.
 * @throws {NotAllowedError} - Throws an error if the verification code is invalid.
 */
export const ConfirmDeleteCertificateHandler: RequestHandler<
    unknown,
    SuccessResponse
> = catchError(
    async (req, res, next) => {
        const { certificateId } = req.params;
        const { _id } = req.loggedUser;

        // check if the certificate exists
        const certificate = await findCertificateById(certificateId, next)

        // check if the course exists
        const course = await findCourseById(certificate.courseId, next)

        // Ensure the instructor exists and is authorized to delete the course
        const user = await findUserById(course.instructorId, next)
        if (user._id.toString() !== _id.toString())
            return next(new NotFoundError('Unauthorized instructor'));

        // check if the verification code is valid
        if (user.verificationCode?.reason !== VerifyReason.deleteCertificate)
            return next(new NotAllowedError('Invalid verification code'));

        // clear the verification code from the user
        await clearVerifyCode(user);

        // delete the certificate from the database
        await certificate.deleteOne({ _id: certificateId });

        res.status(200).json({
            status: true,
            message: 'Certificate deleted successfully',
            data: null,
        });

    }
)

