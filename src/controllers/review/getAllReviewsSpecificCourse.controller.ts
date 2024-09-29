import { RequestHandler } from "express";

import { catchError } from "../../middlewares/errorHandling.middleware";
import { NotFoundError } from "../../errors/notFoundError";
import { SuccessResponse } from "../../types/response";
import { Reviews } from "../../models/review.models";

/**
 * Handler to fetch all reviews for a specific course.
 * 
 * This function retrieves all reviews for the specified course ID.
 * 
 * @route GET /api/courses/:courseId/reviews
 * 
 * @param {Request} req - The request object containing the course ID in the params.
 * @param {Response} res - The response object used to send the reviews data.
 * @param {NextFunction} next - The next middleware function for error handling.
 * 
 * @returns {Promise<void>} - A promise that resolves when the reviews are successfully fetched.
 * 
 * @throws {NotFoundError} - Throws an error if no reviews are found for the given course.
 */
export const getAllReviewsSpecificCourseHandler: RequestHandler<
    unknown,
    SuccessResponse
> = catchError(
    async (req, res, next) => {
        const { courseId } = req.params;
        
        const reviews = await Reviews.find({ entityType: 'course', entityId: courseId });
        if (!reviews) return next(new NotFoundError('Reviews not found'));

        res.status(200).json({
            status: true,
            message: 'Fetched reviews successfully',
            data: reviews,
        });

    }
)