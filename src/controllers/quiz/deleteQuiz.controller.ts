import { RequestHandler } from "express";

import { catchError } from "../../middlewares/errorHandling.middleware";
import { NotAllowedError } from "../../errors/notAllowedError";
import { NotFoundError } from "../../errors/notFoundError";
import { VerifyReason } from "../../types/verify-reason";
import { SuccessResponse } from "../../types/response";
import { Courses } from "../../models/course.models";
import { mailTransporter } from "../../utils/mail";
import { generateCode } from "../../utils/random";
import { Users } from "../../models/user.models";
import { Quiz } from "../../models/quiz.models";
import { hashCode } from "../../utils/crypto";


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

        const quiz = await Quiz.findById(quizId);
        if (!quiz) return next(new NotFoundError('Quiz not found'));

        const course = await Courses.findById(quiz.courseId)
        if (!course) return next(new NotFoundError('Course not found'));

        const user = await Users.findById(_id);
        if (!user) return next(new NotFoundError('User not found'));
        if (course?.instructorId.toString() !== _id.toString())
            return next(new NotAllowedError('You are not allowed to delete this quiz'));

        // Generate a verification code for quiz deletion
        const code = generateCode();
        user.verificationCode = {
            code: hashCode(code),
            expireAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes expiration
            reason: VerifyReason.deleteQuiz,
            tempEmail: null,
        };

        // Send verification code to user's email
        await mailTransporter.sendMail({
            to: user.email,
            subject: `Verification code to delete ${quiz.title} your quiz`,
            html: `Verification code: <strong>${code}</strong>`,
        });

        await user.save();

        res.status(200).json({
            status: true,
            message: 'Check your email to confirm quiz deletion',
            data: null,
        });

    }
)