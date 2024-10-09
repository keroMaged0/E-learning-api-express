import { RequestHandler } from "express";

import { catchError } from "../../middlewares/errorHandling.middleware";
import { findCourseById } from "../../services/entities/course.service";
import { findQuizById } from "../../services/entities/quiz.service";
import { NotFoundError } from "../../errors/notFoundError";
import { Question } from "../../models/question.models";
import { SuccessResponse } from "../../types/response";
import { Quiz } from "../../models/quiz.models";

/**
 * Handler function to create a new question for a specific quiz.
 * 
 * This function handles the process of adding a question to a quiz after verifying:
 * - The existence of the quiz.
 * - The validity of the course associated with the quiz.
 * - The authorization of the instructor trying to add the question.
 * 
 * @param {Request} req - The incoming request containing quizId, questionText, options, and correctAnswer in the body.
 * @param {Response} res - The response object that will return the success message and question data.
 * @param {NextFunction} next - The next middleware function in case of errors.
 * 
 * @returns {Promise<void>} - A promise that resolves to a JSON response if successful, or an error if not.
 * 
 * @throws {NotFoundError} - Throws an error if the quiz, course, or instructor is not found or unauthorized.
 */
export const createQuestionHandler: RequestHandler<
    unknown,
    SuccessResponse
> = catchError(
    async (req, res, next) => {
        const { quizId, questionText, options, correctAnswer } = req.body;
        const { _id } = req.loggedUser;

        // Check if the quiz exists
        const quiz = await findQuizById(quizId, next);

        // Check if the course exists
        const course = await findCourseById(quiz.courseId, next)

        // Check if the logged-in instructor is authorized to add a question to this course
        if (course.instructorId.toString() !== _id.toString()) {
            return next(new NotFoundError('Unauthorized instructor'));
        }

        const question = await Question.create({
            quizId,
            questionText,
            options,
            correctAnswer
        });

        // Add the question's ID to the quiz's questions array
        await Quiz.updateOne(
            { _id: quizId },
            { $push: { questions: question._id } }
        );

        return res.status(201).json({
            success: true,
            message: 'Question created successfully',
            data: question
        });
    }
)