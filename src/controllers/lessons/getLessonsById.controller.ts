import { RequestHandler } from "express";

import { catchError } from "../../middlewares/errorHandling.middleware";
import { findCourse } from "../../services/entities/course.service";
import { NotFoundError } from "../../errors/notFoundError";
import { SuccessResponse } from "../../types/response";
import { Lessons } from "../../models/lesson.models";

/**
 * Handler to retrieve a lesson by its ID.
 * @param {Request} req - The request object containing the lesson ID in parameters.
 * @param {Response} res - The response object used to send a response.
 * @param {NextFunction} next - The next middleware function in the stack.
 * @returns {Promise<void>} - A promise that resolves to void.
 * @throws {NotFoundError} - Throws an error if the course or lesson is not found.
 */
export const getLessonsByIdHandler: RequestHandler<
    unknown,
    SuccessResponse,
    { lessonId: string }
> = catchError(
    async (req, res, next) => {
        const { lessonId } = req.params;


        // Check if the course exists with the provided lessonId
        await findCourse({ lessonsId: { $in: [lessonId] } }, next);

        // Retrieve the lesson by ID and populate instructor information
        const lesson = await Lessons.findById(lessonId).populate([
            { path: 'instructorId', select: 'name' },
            { path: 'courseId' },
            { path: 'videoId' }
        ]);
        if (!lesson) return next(new NotFoundError('Lesson not found'));

        res.status(200).json({
            status: true,
            message: 'Lesson data retrieved successfully',
            data: lesson,  
        });
    }
);
