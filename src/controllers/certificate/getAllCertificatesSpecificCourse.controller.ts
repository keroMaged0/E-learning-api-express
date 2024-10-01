import { RequestHandler } from "express";

import { checkEnrolledCourse } from "../enrolledCourse/checkEnrolledCourse.controller";
import { catchError } from "../../middlewares/errorHandling.middleware";
import { Certificate } from "../../models/certificate.models";
import { NotFoundError } from "../../errors/notFoundError";
import { SuccessResponse } from "../../types/response";

/**
 * Handler to retrieve all certificates for a specific course.
 *
 * This handler checks if the user is enrolled in the specified course, 
 * then retrieves all certificates associated with that course. 
 * If no certificates are found, it returns a not found error.
 *
 * @param {Request} req - The request object containing the course ID in the route parameters.
 * @param {Response} res - The response object used to send the retrieved certificates.
 * @param {NextFunction} next - The next middleware function to call in case of an error.
 *
 * @returns {Promise<void>} - A promise that resolves to void.
 *
 * @throws {NotFoundError} - Throws an error if no certificates are found for the course.
 */
export const getAllCertificateSpecificCourseHandler: RequestHandler<
    unknown,
    SuccessResponse
> = catchError(
    async (req, res, next) => {
        const { courseId } = req.params;
        const { _id } = req.loggedUser;

        // Check if the user is enrolled in the specified course
        await checkEnrolledCourse({ courseId, userId: _id, next });

        // Check if any certificates were found
        const certificates = await Certificate.find({ courseId });
        if (!certificates || certificates.length === 0) return next(new NotFoundError('No certificates found'));

        res.status(200).json({
            status: true,
            message: 'data retrieved successfully',
            data: certificates,
        });

    }
)

