import { RequestHandler } from "express";

import { catchError } from "../../middlewares/errorHandling.middleware";
import { NotAllowedError } from "../../errors/notAllowedError";
import { NotFoundError } from "../../errors/notFoundError";
import { VerifyReason } from "../../types/verify-reason";
import { SuccessResponse } from "../../types/response";
import { Question } from "../../models/question.models";
import { Courses } from "../../models/course.models";
import { Users } from "../../models/user.models";
import { Quiz } from "../../models/quiz.models";

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

        const question = await Question.findById(questionId);
        if (!question) return next(new NotFoundError('Question not found'));

        const quiz = await Quiz.findById(question.quizId);
        if (!quiz) return next(new NotFoundError('Quiz not found'));

        const course = await Courses.findById(quiz.courseId)
        if (!course) return next(new NotFoundError('Course not found'));

        const user = await Users.findById(_id);
        if (!user) return next(new NotFoundError('User not found'));

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