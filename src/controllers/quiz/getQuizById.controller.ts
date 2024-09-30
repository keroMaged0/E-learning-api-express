import { RequestHandler } from "express";

import { checkEnrolledCourse } from "../enrolledCourse/checkEnrolledCourse.controller";
import { catchError } from "../../middlewares/errorHandling.middleware";
import { NotFoundError } from "../../errors/notFoundError";
import { SuccessResponse } from "../../types/response";
import { Quiz } from "../../models/quiz.models";

/**
 * Handler to get a quiz by its ID.
 * 
 * This handler fetches a quiz and its associated questions if the user is enrolled in the corresponding course.
 * 
 * @param {Request} req - The request object containing the quiz ID in the parameters.
 * @param {Response} res - The response object used to send the fetched quiz.
 * @param {NextFunction} next - The next middleware function to call in case of an error.
 * 
 * @returns {Promise<void>} - A promise that resolves to void.
 * 
 * @throws {NotFoundError} - Throws an error if the quiz is not found.
 */
export const getQuizByIdHandler: RequestHandler<
    unknown,
    SuccessResponse
> = catchError(
    async (req, res, next) => {
        const { _id } = req.loggedUser;
        const { quizId } = req.params;

        const quiz = await Quiz.findById(quizId).populate([
            {
                path: 'questions',
            }
        ]);;
        if (!quiz) return next(new NotFoundError('Quiz not found'));

        // Check if the user is enrolled in the course associated with the quiz
        await checkEnrolledCourse({ courseId: quiz.courseId, userId: _id, next });

        res.status(200).json({
            status: true,
            message: 'Quiz fetched successfully',
            data: {
                quiz
            }
        });

    }
)