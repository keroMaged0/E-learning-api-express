import { RequestHandler } from "express";

import { checkEnrolledCourse } from "../enrolledCourse/checkEnrolledCourse.controller";
import { catchError } from "../../middlewares/errorHandling.middleware";
import { NotFoundError } from "../../errors/notFoundError";
import { Question } from "../../models/question.models";
import { SuccessResponse } from "../../types/response";
import { Quiz } from "../../models/quiz.models";

/**
 * Handler function to retrieve all questions for a specific quiz.
 * 
 * This function retrieves all questions related to a specific quiz, 
 * ensuring that the user requesting the questions is enrolled in the 
 * course associated with the quiz.
 * 
 * @param {Request} req - The request object containing the quizId as a route parameter.
 * @param {Response} res - The response object used to send the list of questions.
 * @param {NextFunction} next - The next middleware function in case of errors.
 * 
 * @returns {Promise<void>} - A promise that resolves to a JSON response with all quiz questions.
 * 
 * @throws {NotFoundError} - Throws an error if the quiz or questions are not found, or if the user is not enrolled in the course.
 */
export const getAllQuestionsSpecificQuizHandler: RequestHandler<
    unknown,
    SuccessResponse
> = catchError(
    async (req, res, next) => {
        const { _id } = req.loggedUser;
        const { quizId } = req.params;

        const quiz = await Quiz.findById(quizId);
        if (!quiz) return next(new NotFoundError('Quiz not found'));

        // Check if the user is enrolled in the course or is the instructor
        await checkEnrolledCourse({ courseId: quiz.courseId, userId: _id, next });

        const questions = await Question.find({ quizId });
        if (!questions) return next(new NotFoundError('Questions not found'));

        return res.status(200).json({
            success: true,
            message: 'Questions retrieved successfully',
            data: questions
        });

    }
)