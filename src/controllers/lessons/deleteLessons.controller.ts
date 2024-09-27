import { RequestHandler } from "express";

import { catchError } from "../../middlewares/errorHandling.middleware";
import { NotFoundError } from "../../errors/notFoundError";
import { VerifyReason } from "../../types/verify-reason";
import { SuccessResponse } from "../../types/response";
import { Lessons } from "../../models/lesson.models";
import { mailTransporter } from "../../utils/mail";
import { generateCode } from "../../utils/random";
import { Users } from "../../models/user.models";
import { hashCode } from "../../utils/crypto";

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
        await generateAndSendVerificationCode(user, lesson.title);
        
        res.status(200).json({
            status: true,
            message: 'Check your email to confirm lesson deletion',
            data: null,
        });
    }
);

/**
 * Generates a verification code, hashes it, and sends it to the user's email.
 * @param {User} user - The user object of the instructor.
 * @param {string} lessonTitle - The title of the lesson to be deleted.
 * @throws {Error} - Throws an error if sending email fails.
 */
const generateAndSendVerificationCode = async (user, lessonTitle: string) => {
    const code = generateCode();

    // Store the hashed verification code and its expiry time
    user.verificationCode = {
        code: hashCode(code),
        expireAt: new Date(Date.now() + 10 * 60 * 1000), 
        reason: VerifyReason.deleteLesson,
        tempEmail: null,
    };

    await mailTransporter.sendMail({
        to: user.email,
        subject: `Verification Code to Delete Lesson: ${lessonTitle}`,
        html: `Your verification code is <strong>${code}</strong>`,
    });

    await user.save();
};
