import { RequestHandler } from "express";

import { checkEnrolledCourse } from "../enrolledCourse/checkEnrolledCourse.controller";
import { findCertificateById } from "../../services/entities/certificate.service";
import { catchError } from "../../middlewares/errorHandling.middleware";
import { NotFoundError } from "../../errors/notFoundError";
import { SuccessResponse } from "../../types/response";

/**
 * Handler to update an existing certificate.
 *
 * This handler checks if the certificate exists, validates user authorization,
 * and updates the title, userId, and courseId of the certificate as needed.
 *
 * @param {Request} req - The request object containing the certificate ID in the route parameters and 
 *                        the new data in the request body.
 * @param {Response} res - The response object used to send the success message.
 * @param {NextFunction} next - The next middleware function to call in case of an error.
 *
 * @returns {Promise<void>} - A promise that resolves to void.
 *
 * @throws {NotFoundError} - Throws an error if the certificate is not found or if the updates are the same as before.
 */
export const updateCertificateHandler: RequestHandler<
    unknown,
    SuccessResponse
> = catchError(
    async (req, res, next) => {
        const { certificateId } = req.params;
        const { title, userId, courseId } = req.body;
        const { _id } = req.loggedUser

        // Check if the certificate exists
        const certificate = await findCertificateById(certificateId,next);

        // Check if the user is authorized to update the certificate
        await checkEnrolledCourse({ courseId: certificate.courseId, userId: _id, next });

        // Update the title if provided and different from the current one
        if (title) {
            if (title === certificate.title) return next(new NotFoundError('Title is same as previous one'));
            certificate.title = title;
        }

        // Update the userId if provided and different from the current one
        if (userId) {
            if (userId === certificate.userId.toString()) return next(new NotFoundError('User ID is same as previous one'));
            
            await checkEnrolledCourse({ courseId: certificate.courseId, userId, next });

            certificate.userId = userId;
        }

        // Update the courseId if provided and different from the current one
        if (courseId) {
            if (courseId === certificate.courseId.toString()) return next(new NotFoundError('Course ID is same as previous one'));

            await checkEnrolledCourse({ courseId, userId: _id, next });

            certificate.courseId = courseId;
        }

        await certificate.save();

        res.status(200).json({
            status: true,
            message: 'Certificate updated successfully',
            data: certificate,
        });

    }
)

