import { RequestHandler } from "express";

import { checkEnrolledCourse } from "../enrolledCourse/checkEnrolledCourse.controller";
import { catchError } from "../../middlewares/errorHandling.middleware";
import { NotFoundError } from "../../errors/notFoundError";
import { SuccessResponse } from "../../types/response";
import { findQuestionById } from "../../services/entities/question.service";
import { findQuizById } from "../../services/entities/quiz.service";

/**
 * Handler to update an existing question by its ID.
 * 
 * This handler updates a question's text, options, and correct answer 
 * based on the provided input, ensuring that the user is authorized 
 * to make changes and that the provided options are valid.
 * 
 * @param {Request} req - The request object containing the question ID in the route params
 * and the new question data in the request body.
 * @param {Response} res - The response object used to send the updated question.
 * @param {NextFunction} next - The next middleware function to call in case of an error.
 * 
 * @returns {Promise<void>} - A promise that resolves to void.
 * 
 * @throws {NotFoundError} - Throws an error if the question or quiz is not found, or if 
 * the updated data is invalid.
 */
export const updateQuestionHandler: RequestHandler<
    unknown,
    SuccessResponse
> = catchError(
    async (req, res, next) => {
        const { questionText, options, correctAnswer } = req.body;
        const { questionId } = req.params;
        const { _id } = req.loggedUser;

        // Check if the question exists
        const question = await findQuestionById(questionId, next);

        // Check if the quiz exists
        const quiz = await findQuizById(question.quizId, next);

        // Check if the user is enrolled in the course or is the instructor
        await checkEnrolledCourse({ courseId: quiz.courseId, userId: _id, next });

        // Update question text if provided and different from the current one
        if (questionText) {
            if (questionText === question.questionText) return next(new NotFoundError('Question text is same as previous'));

            question.questionText = questionText;
        }

        // Update options if provided and different from the current ones
        if (options) {
            if (options === question.options) return next(new NotFoundError('Options are same as previous'));

            question.options = options;
        }

        // Update correct answer if provided and different from the current one
        if (correctAnswer) {
            if (correctAnswer === question.correctAnswer) return next(new NotFoundError('Correct Answer is same as previous'));

            question.correctAnswer = correctAnswer;

        }

        // Validate that the correct answer is within the options
        if (!options.includes(question.correctAnswer)) return next(new NotFoundError('Correct Answer is not in options'));
        if (!question.options.includes(correctAnswer)) return next(new NotFoundError('Correct option is not in options'));


        await question.save();

        res.status(200).json({
            status: true,
            message: 'Question updated successfully',
            data: {
                question
            },
        });
    }
)