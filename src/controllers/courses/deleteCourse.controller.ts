import { RequestHandler } from "express";

import { catchError } from "../../middlewares/errorHandling.middleware";
import { sendVerifyCode } from "../auth/utils/verifyCode.utils";
import { NotFoundError } from "../../errors/notFoundError";
import { VerifyReason } from "../../types/verify-reason";
import { SuccessResponse } from "../../types/response";
import { Courses } from "../../models/course.models";
import { Users } from "../../models/user.models";

/**
 * Handler to initiate the deletion of a course.
 * @param {Request} req - The request object containing the course ID.
 * @param {Response} res - The response object used to send a response.
 * @param {NextFunction} next - The next middleware function in the stack.
 * 
 * @returns {Promise<void>} - A promise that resolves to void.
 * 
 * @throws {NotFoundError} - Throws a NotFoundError if the course or user is not found.
 */
export const deleteCourseHandler: RequestHandler<
    unknown,
    SuccessResponse
> = catchError(
    async (req, res, next) => {
        const { courseId } = req.params;
        const { _id } = req.loggedUser;

        const course = await Courses.findById(courseId);
        if (!course) return next(new NotFoundError('Course not found'));

        // Ensure the instructor exists and is authorized to delete the course
        const user = await Users.findById({ _id: course.instructorId });
        if (!user) return next(new NotFoundError('User not found'));
        if (user._id.toString() !== _id.toString()) {
            return next(new NotFoundError('Unauthorized instructor'));
        }

        // Generate a verification code for deletion confirmation
        await sendVerifyCode({
            user,
            reason: VerifyReason.deleteCourse,
            subject: `Verification code to delete ${course.title} course`
        })

        res.status(200).json({
            status: true,
            message: 'Check your email to confirm course deletion',
            data: null,
        });
    }
);
