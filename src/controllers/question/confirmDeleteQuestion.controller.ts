import { RequestHandler } from "express";

import { findQuestionById } from "../../services/entities/question.service";
import { catchError } from "../../middlewares/errorHandling.middleware";
import { findCourseById } from "../../services/entities/course.service";
import { findUserById } from "../../services/entities/user.service";
import { findQuizById } from "../../services/entities/quiz.service";
import { NotAllowedError } from "../../errors/notAllowedError";
import { NotFoundError } from "../../errors/notFoundError";
import { VerifyReason } from "../../types/verify-reason";
import { SuccessResponse } from "../../types/response";

/**
 * Handler to confirm the deletion of a question after the user provides a valid verification code.
 * 
 * This handler checks if the user is authorized to delete the question and verifies the provided
 * verification code before proceeding with the deletion.
 * 
 * @param {Request} req - The request object containing the question ID in the route params.
 * @param {Response} res - The response object used to send a confirmation message.
 * @param {NextFunction} next - The next middleware function to call in case of an error.
 * 
 * @returns {Promise<void>} - A promise that resolves to void.
 * 
 * @throws {NotFoundError} - Throws an error if the question, quiz, course, or user is not found.
 * @throws {NotAllowedError} - Throws an error if the verification code is invalid or the user is not authorized.
 */
export const ConfirmDeleteQuestionHandler: RequestHandler<
    unknown,
    SuccessResponse
> = catchError(
    async (req, res, next) => {
        const { questionId } = req.params;
        const { _id } = req.loggedUser;

        // Check if the question exists
        const question = await findQuestionById(questionId, next);

        // Check if the quiz exists
        const quiz = await findQuizById(question.quizId, next);

        // Check if the course exists
        await findCourseById(quiz.courseId, next)

        const user = await findUserById(_id, next);

        // Check if the user is authorized to delete the question
        if (user._id.toString() !== _id.toString()) {
            return next(new NotFoundError('Unauthorized instructor'));
        }

        // Check if the verification code is valid
        if (user.verificationCode?.reason !== VerifyReason.deleteQuestion) {
            return next(new NotAllowedError('Invalid verification code'));
        }

        // Clear the verification reason to prevent reuse
        user.verificationCode.reason = null;
        await user.save();

        await question.deleteOne({ _id: questionId });

        res.status(200).json({
            status: true,
            message: 'question deleted successfully',
            data: null
        });

    }
)