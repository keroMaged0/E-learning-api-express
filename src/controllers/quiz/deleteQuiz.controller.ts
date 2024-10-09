import { RequestHandler } from "express";

import { sendVerifyCode } from "../../services/entities/verifyCode.service";
import { catchError } from "../../middlewares/errorHandling.middleware";
import { findCourseById } from "../../services/entities/course.service";
import { findUserById } from "../../services/entities/user.service";
import { findQuizById } from "../../services/entities/quiz.service";
import { NotAllowedError } from "../../errors/notAllowedError";
import { VerifyReason } from "../../types/verify-reason";
import { SuccessResponse } from "../../types/response";



/**
 * Handler to delete a quiz.
 * 
 * This handler verifies the instructor's identity by sending a verification code
 * to their email address before allowing the quiz deletion.
 * 
 * @param {Request} req - The request object containing the quiz ID in the parameters.
 * @param {Response} res - The response object used to send the confirmation message.
 * @param {NextFunction} next - The next middleware function to call in case of an error.
 * 
 * @returns {Promise<void>} - A promise that resolves to void.
 * 
 * @throws {NotFoundError} - Throws an error if the quiz or course is not found.
 * @throws {NotAllowedError} - Throws an error if the user is not authorized to delete the quiz.
 */
export const deleteQuizHandler: RequestHandler<
    unknown,
    SuccessResponse
> = catchError(
    async (req, res, next) => {
        const { quizId } = req.params;
        const { _id } = req.loggedUser;

        // Check if the quiz exists
        const quiz = await findQuizById(quizId, next);

        // Check if the course exists
        const course = await findCourseById(quiz.courseId, next)

        // Check if the user exists
        const user = await findUserById(_id, next);
        if (course?.instructorId.toString() !== _id.toString())
            return next(new NotAllowedError('You are not allowed to delete this quiz'));

        // Generate a verification code for quiz deletion
        const expireAt = await sendVerifyCode({
            user,
            reason: VerifyReason.deleteQuiz,
            subject: `Verification code to delete ${quiz.title} your quiz`,
        })

        res.status(200).json({
            status: true,
            message: 'Check your email to confirm quiz deletion',
            data: expireAt,
        });

    }
)