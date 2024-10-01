import { RequestHandler } from "express";

import { catchError } from "../../middlewares/errorHandling.middleware";
import { NotAllowedError } from "../../errors/notAllowedError";
import { Certificate } from "../../models/certificate.models";
import { NotFoundError } from "../../errors/notFoundError";
import { VerifyReason } from "../../types/verify-reason";
import { SuccessResponse } from "../../types/response";
import { Courses } from "../../models/course.models";
import { Users } from "../../models/user.models";

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

        const certificate = await Certificate.findById(certificateId);
        if (!certificate) return next(new NotFoundError('Certificate not found'));

        const course = await Courses.findById(certificate.courseId);
        if (!course) return next(new NotFoundError('Course not found'));

        // Ensure the instructor exists and is authorized to delete the course
        const user = await Users.findById({_id: course.instructorId});
        if (!user) return next(new NotFoundError('User not found'));
        if (user._id.toString() !== _id.toString()) {
            return next(new NotFoundError('Unauthorized instructor'));
        }
        if (user.verificationCode?.reason !== VerifyReason.deleteCertificate) {
            return next(new NotAllowedError('Invalid verification code'));
        }
        user.verificationCode.reason = null;
        await user.save();

        await certificate.deleteOne({ _id: certificateId });

        res.status(200).json({
            status: true,
            message: 'Certificate deleted successfully',
            data: null,
        });

    }
)

