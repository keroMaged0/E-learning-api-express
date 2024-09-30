import { RequestHandler } from "express";

import { checkEnrolledCourse } from "../enrolledCourse/checkEnrolledCourse.controller";
import { catchError } from "../../middlewares/errorHandling.middleware";
import { NotFoundError } from "../../errors/notFoundError";
import { Question } from "../../models/question.models";
import { SuccessResponse } from "../../types/response";
import { Quiz } from "../../models/quiz.models";

/**
 * Handler to fetch a specific question by its ID.
 * 
 * This handler retrieves a question by its ID, verifies the existence of
 * the associated quiz, and checks if the user is authorized to access the quiz 
 * (either as a student enrolled in the course or as the course instructor).
 * 
 * @param {Request} req - The request object containing the question ID in the route params.
 * @param {Response} res - The response object used to send the fetched question.
 * @param {NextFunction} next - The next middleware function to call in case of an error.
 * 
 * @returns {Promise<void>} - A promise that resolves to void.
 * 
 * @throws {NotFoundError} - Throws an error if the question or quiz is not found.
 */
export const getQuestionByIdHandler: RequestHandler<
    unknown,
    SuccessResponse
> = catchError(
    async (req, res, next) => {
        const { questionId } = req.params;
        const { _id } = req.loggedUser;

        const question = await Question.findById(questionId);
        if (!question) return next(new NotFoundError('Question not found'));

        const quiz = await Quiz.findById(question.quizId)
        if (!quiz) return next(new NotFoundError('Quiz not found'));

        // Check if the user is enrolled in the course or is the instructor
        await checkEnrolledCourse({ courseId: quiz.courseId, userId: _id, next });

        res.status(200).json({
            status: true,
            message: 'Question fetched successfully',
            data: {
                question
            },
        });

    }
)