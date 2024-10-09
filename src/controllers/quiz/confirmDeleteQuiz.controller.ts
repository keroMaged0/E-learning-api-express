import { RequestHandler } from "express";

import { catchError } from "../../middlewares/errorHandling.middleware";
import { findCourseById } from "../../services/entities/course.service";
import { findQuizById } from "../../services/entities/quiz.service";
import { findUserById } from "../../services/entities/user.service";
import { NotAllowedError } from "../../errors/notAllowedError";
import { NotFoundError } from "../../errors/notFoundError";
import { VerifyReason } from "../../types/verify-reason";
import { SuccessResponse } from "../../types/response";

/**
 * Handler to confirm the deletion of a quiz.
 * 
 * This handler verifies the user's identity using the verification code 
 * before allowing the quiz to be deleted.
 * 
 * @param {Request} req - The request object containing the quiz ID in the parameters.
 * @param {Response} res - The response object used to send the confirmation message.
 * @param {NextFunction} next - The next middleware function to call in case of an error.
 * 
 * @returns {Promise<void>} - A promise that resolves to void.
 * 
 * @throws {NotFoundError} - Throws an error if the quiz, course, or user is not found.
 * @throws {NotAllowedError} - Throws an error if the verification code is invalid.
 */
export const ConfirmDeleteQuizHandler: RequestHandler<
    unknown,
    SuccessResponse
> = catchError(
    async (req, res, next) => {
        const { quizId } = req.params;
        const { _id } = req.loggedUser;

        // Check if the quiz exists
        const quiz = await findQuizById(quizId, next);

        // Check if the course exists
        await findCourseById(quiz.courseId, next);

        // Check if the user exists
        const user = await findUserById(_id, next);

        // Verify that the user is the instructor and that the verification code is valid
        if (user._id.toString() !== _id.toString()) {
            return next(new NotFoundError('Unauthorized instructor'));
        }
        if (user.verificationCode?.reason !== VerifyReason.deleteQuiz) {
            return next(new NotAllowedError('Invalid verification code'));
        }

        // Clear the verification code reason and save the user
        user.verificationCode.reason = null;
        await user.save();

        // Delete the quiz from the database
        await quiz.deleteOne({ _id: quizId });

        res.status(200).json({
            status: true,
            message: 'Quiz deleted successfully',
            data: null
        });

    }
)