import { RequestHandler } from "express";

import { catchError } from "../../middlewares/errorHandling.middleware";
import { findCourseById } from "../../services/entities/course.service";
import { UnauthorizedError } from "../../errors/UnauthorizedError";
import { SuccessResponse } from "../../types/response";
import { Quiz } from "../../models/quiz.models";

/**
 * Handler to create a new quiz for a specific course.
 * 
 * This handler checks if the course exists and if the user is authorized to create a quiz
 * for the course before creating the quiz.
 * 
 * @param {Request} req - The request object containing the quiz details in the body.
 * @param {Response} res - The response object used to send a success message along with the created quiz.
 * @param {NextFunction} next - The next middleware function to call in case of an error.
 * 
 * @returns {Promise<void>} - A promise that resolves to void.
 * 
 * @throws {NotFoundError} - Throws an error if the course is not found.
 * @throws {UnauthorizedError} - Throws an error if the user is not authorized to create a quiz for the course.
 */
export const createQuizHandler: RequestHandler<
    unknown,
    SuccessResponse
> = catchError(
    async (req, res, next) => {
        const { title, description, courseId } = req.body;
        const { _id } = req.loggedUser;

        const course = await findCourseById(courseId, next);

        // Check if the logged user is the instructor of the course
        if (_id.toString() !== course.instructorId.toString()) {
            return next(new UnauthorizedError('You are not authorized to create a quiz for this course'));
        }

        const quiz = await Quiz.create({
            title,
            description,
            courseId,
            questions: []
        });

        res.status(201).json({
            status: true,
            message: 'Quiz created successfully',
            data: {
                quiz
            },
        });

    }
)