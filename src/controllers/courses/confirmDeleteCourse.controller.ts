import { RequestHandler } from "express";

import { catchError } from "../../middlewares/errorHandling.middleware";
import { findCourseById } from "../../services/entities/course.service";
import { findUserById } from "../../services/entities/user.service";
import { NotAllowedError } from "../../errors/notAllowedError";
import { NotFoundError } from "../../errors/notFoundError";
import { VerifyReason } from "../../types/verify-reason";
import { ChatRoom } from "../../models/chatRoom.models";
import { SuccessResponse } from "../../types/response";
import { DeleteMedia } from "../../utils/uploadMedia";
import { Lessons } from "../../models/lesson.models";
import { Videos } from "../../models/video.models";

/**
 * Handler to confirm the deletion of a course.
 * @param {Request} req - The request object containing the course ID.
 * @param {Response} res - The response object used to send a response.
 * @param {NextFunction} next - The next middleware function in the stack.
 * 
 * @returns {Promise<void>} - A promise that resolves to void.
 * 
 * @throws {NotFoundError} - Throws a NotFoundError if the course or user is not found.
 * @throws {NotAllowedError} - Throws a NotAllowedError if the verification code is invalid.
 */
export const confirmDeleteCourseHandler: RequestHandler<
    unknown,
    SuccessResponse
> = catchError(
    async (req, res, next) => {
        const { courseId } = req.params;
        const { _id } = req.loggedUser;

        // Check if the course exists
        const course = await findCourseById(courseId, next);
        if (!course) return next(new NotFoundError('Course not found'));

        // Ensure the instructor exists and is authorized to delete the course
        const user = await findUserById(course.instructorId, next);
        if (user._id.toString() !== _id.toString()) {
            return next(new NotFoundError('Unauthorized instructor'));
        }
        if (user.verificationCode?.reason !== VerifyReason.deleteCourse) {
            return next(new NotAllowedError('Invalid verification code'));
        }
        user.verificationCode.reason = null;
        await user.save();

        // Define the media path in Cloudinary for deletion
        const pathUrl = course.imageCover.public_id.split(`${course.folderId}`)[0] + course.folderId;

        await DeleteMedia(`${pathUrl}/`);

        // Delete the course, associated lessons, and videos from the database
        await course.deleteOne({ _id: courseId });
        await Lessons.deleteMany({ courseId: courseId });
        await Videos.deleteMany({ lessonId: { $in: course.lessonsId } });
        await ChatRoom.deleteOne({ courseId })

        // Return success response confirming deletion
        res.status(200).json({
            status: true,
            message: `Course: (${course.title}) deleted successfully`,
            data: null,
        });
    }
);



