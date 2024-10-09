import { RequestHandler } from "express";

import { sendVerifyCode } from "../../services/entities/verifyCode.service";
import { catchError } from "../../middlewares/errorHandling.middleware";
import { findLessonById } from "../../services/entities/lesson.service";
import { findUserById } from "../../services/entities/user.service";
import { NotFoundError } from "../../errors/notFoundError";
import { VerifyReason } from "../../types/verify-reason";
import { SuccessResponse } from "../../types/response";

/**
 * Handler to delete a lesson by sending a verification email to the instructor.
 * @param {Request} req - The request object containing lesson ID in params.
 * @param {Response} res - The response object used to send a response.
 * @param {NextFunction} next - The next middleware function in the stack.
 * @returns {Promise<void>} - A promise that resolves to void.
 * @throws {NotFoundError} - Throws an error if the lesson or user is not found.
 */
export const deleteLessonsHandler: RequestHandler<unknown, SuccessResponse> = catchError(
    async (req, res, next) => {
        const { lessonId } = req.params;
        const { _id } = req.loggedUser;

        // Check if the lesson exists
        const lesson = await findLessonById(lessonId,next);

        // Check if the user is the instructor of the lesson
        const user = await findUserById(lesson.instructorId,next);
        if (user._id.toString() !== _id.toString()) {
            return next(new NotFoundError('Unauthorized instructor'));
        }

        // Generate and send verification code to the user's email
        await sendVerifyCode({
            user,
            reason:VerifyReason.deleteLesson,
            subject: `Verification Code to Delete Lesson: ${lesson.title}`,
        })
        
        res.status(200).json({
            status: true,
            message: 'Check your email to confirm lesson deletion',
            data: null,
        });
    }
);
