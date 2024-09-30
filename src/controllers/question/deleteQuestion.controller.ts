import { RequestHandler } from "express";

import { catchError } from "../../middlewares/errorHandling.middleware";
import { NotAllowedError } from "../../errors/notAllowedError";
import { NotFoundError } from "../../errors/notFoundError";
import { VerifyReason } from "../../types/verify-reason";
import { Question } from "../../models/question.models";
import { SuccessResponse } from "../../types/response";
import { Courses } from "../../models/course.models";
import { mailTransporter } from "../../utils/mail";
import { generateCode } from "../../utils/random";
import { Users } from "../../models/user.models";
import { Quiz } from "../../models/quiz.models";
import { hashCode } from "../../utils/crypto";

/**
 * Handler to delete a question by its ID.
 * 
 * This handler initiates the process of deleting a question by sending
 * a verification code to the user's email for confirmation. The user must
 * be the instructor of the associated course to proceed with the deletion.
 * 
 * @param {Request} req - The request object containing the question ID in the route params.
 * @param {Response} res - The response object used to send a confirmation message.
 * @param {NextFunction} next - The next middleware function to call in case of an error.
 * 
 * @returns {Promise<void>} - A promise that resolves to void.
 * 
 * @throws {NotFoundError} - Throws an error if the question, quiz, course, or user is not found.
 * @throws {NotAllowedError} - Throws an error if the user is not allowed to delete the question.
 */
export const deleteQuestionHandler: RequestHandler<
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

        // Check if the user is the instructor of the course
        if (course?.instructorId.toString() !== _id.toString())
            return next(new NotAllowedError('You are not allowed to delete this quiz'));

        // Generate a verification code for deletion confirmation
        const code = generateCode();
        user.verificationCode = {
            code: hashCode(code),
            expireAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes expiration
            reason: VerifyReason.deleteQuestion,
            tempEmail: null,
        };

        // Send the verification code to the user's email
        await mailTransporter.sendMail({
            to: user.email,
            subject: `Verification code to delete ${question.questionText} your question`,
            html: `Verification code: <strong>${code}</strong>`,
        });

        await user.save();

        res.status(200).json({
            status: true,
            message: 'Check your email to confirm question deletion',
            data: null,
        });


    }
)