import { RequestHandler } from "express";

import { catchError } from "../../middlewares/errorHandling.middleware";
import { sendVerifyCode } from "../auth/utils/verifyCode.utils";
import { NotFoundError } from "../../errors/notFoundError";
import { VerifyReason } from "../../types/verify-reason";
import { SuccessResponse } from "../../types/response";
import { Lessons } from "../../models/lesson.models";
import { Users } from "../../models/user.models";

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

        const lesson = await Lessons.findById(lessonId);
        if (!lesson) return next(new NotFoundError('Lesson not found'));

        const user = await Users.findById(lesson.instructorId);
        if (!user) return next(new NotFoundError('User not found'));
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
