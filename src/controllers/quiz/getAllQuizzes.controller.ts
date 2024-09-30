import { RequestHandler } from "express";

import { checkEnrolledCourse } from "../enrolledCourse/checkEnrolledCourse.controller";
import { catchError } from "../../middlewares/errorHandling.middleware";
import { NotFoundError } from "../../errors/notFoundError";
import { SuccessResponse } from "../../types/response";
import { Quiz } from "../../models/quiz.models";


/**
 * Handler to get all quizzes for a specific course.
 * 
 * This handler checks if the user is enrolled in the course before fetching the quizzes.
 * 
 * @param {Request} req - The request object containing the course ID in the parameters.
 * @param {Response} res - The response object used to send the fetched quizzes.
 * @param {NextFunction} next - The next middleware function to call in case of an error.
 * 
 * @returns {Promise<void>} - A promise that resolves to void.
 * 
 * @throws {NotFoundError} - Throws an error if no quizzes are found for the course.
 */

export const getAllQuizzesSpecificCourseHandler: RequestHandler<
    unknown,
    SuccessResponse
> = catchError(
    async (req, res, next) => {
        const { _id } = req.loggedUser;
        const { courseId } = req.params;

        await checkEnrolledCourse({ courseId, userId: _id, next });

        const quizzes = await Quiz.find({ courseId })
            .populate([
                {
                    path: 'questions',
                }
            ]);
        if (!quizzes) return next(new NotFoundError('No quizzes found for this course'));

        res.status(200).json({
            status: true,
            message: 'Quizzes fetched successfully',
            data: {
                quizzes
            }
        });
    }

)