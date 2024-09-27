import { RequestHandler } from "express";

import { catchError } from "../../middlewares/errorHandling.middleware";
import { NotFoundError } from "../../errors/notFoundError";
import { SuccessResponse } from "../../types/response";
import { Courses } from "../../models/course.models";

/**
 * Handler to retrieve a course by its ID.
 * @param {Request} req - The request object containing the course ID.
 * @param {Response} res - The response object used to send a response.
 * @param {NextFunction} next - The next middleware function in the stack.
 * 
 * @returns {Promise<void>} - A promise that resolves to void.
 * 
 * @throws {NotFoundError} - Throws a NotFoundError if the course is not found.
 */
export const getCourseByIdHandler: RequestHandler<
    unknown,
    SuccessResponse
> = catchError(
    async (req, res, next) => {
        const { courseId } = req.params;

        const course = await Courses.findById(courseId).populate([
            { path: 'instructorId', select: 'name' },
            { path: 'lessonsId', select: 'title duration' }, 
            // { path: 'ratingId', select: 'rating' } // Uncomment if needed
        ]);
        if (!course) return next(new NotFoundError('Course not found'));

        // Return a success response with the course data
        res.status(200).json({
            status: true,
            message: 'Data retrieved successfully',
            data: course
        });
    }
);
