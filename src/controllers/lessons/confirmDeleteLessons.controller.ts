import { RequestHandler } from "express";

import { catchError } from "../../middlewares/errorHandling.middleware";
import { cloudinaryConnection } from "../../services/cloudinary.service";
import { findLessonById } from "../../services/entities/lesson.service";
import { findUserById } from "../../services/entities/user.service";
import { NotAllowedError } from "../../errors/notAllowedError";
import { NotFoundError } from "../../errors/notFoundError";
import { VerifyReason } from "../../types/verify-reason";
import { SuccessResponse } from "../../types/response";
import { Lessons } from "../../models/lesson.models";
import { Videos } from "../../models/video.models";
import { logger } from "../../config/logger";

/**
 * Handler to confirm lesson deletion by verifying the instructor's code.
 * @param {Request} req - The request object containing lesson ID in params.
 * @param {Response} res - The response object used to send a response.
 * @param {NextFunction} next - The next middleware function in the stack.
 * @returns {Promise<void>} - A promise that resolves to void.
 * @throws {NotFoundError} - Throws an error if the lesson or user is not found.
 * @throws {NotAllowedError} - Throws an error if the verification code is invalid.
 */
export const confirmDeleteLessonsHandler: RequestHandler<unknown, SuccessResponse> = catchError(
    async (req, res, next) => {
        const { lessonId } = req.params;
        const { _id: instructorId } = req.loggedUser;

        // Check if the lesson exists
        const lesson = await findLessonById(lessonId, next);

        // Check if the instructor is authorized to delete the lesson
        const user = await findUserById(lesson.instructorId,next);
        if (user._id.toString() !== instructorId.toString()) {
            return next(new NotFoundError('Unauthorized instructor'));
        }
        if (user.verificationCode?.reason !== VerifyReason.deleteLesson) {
            return next(new NotAllowedError('Invalid verification code'));
        }
        user.verificationCode.reason = null;
        await user.save();

        // Delete media associated with the lesson from Cloudinary
        const mediaPath = lesson.imageCover.public_id.split(`${lesson.folderId}`)[0] + lesson.folderId;

        await deleteLessonMedia(mediaPath);

        // Delete the lesson and any related videos
        await Promise.all([
            Lessons.deleteOne({ _id: lesson._id }),
            Videos.deleteOne({ lessonId: lesson._id }),
        ]);

        res.status(200).json({
            status: true,
            message: `Lesson :( ${lesson.title} ) deleted successfully`,
            data: null,
        });
    }
);

/**
 * Deletes media associated with the lesson from Cloudinary.
 * @param {string} mediaPath - The path of the media to be deleted.
 * @throws {Error} - Throws an error if there is an issue during the deletion process.
 */
const deleteLessonMedia = async (mediaPath: string) => {
    try {
        await cloudinaryConnection().api.delete_resources_by_prefix(mediaPath);
        await cloudinaryConnection().api.delete_folder(mediaPath);
    } catch (error) {
        // Log the error and throw a generic error message
        logger.error(error);
        throw new Error("Internal server error while deleting media");
    }
};
