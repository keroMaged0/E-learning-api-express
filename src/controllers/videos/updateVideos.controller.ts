import { RequestHandler } from "express";

import { catchError } from "../../middlewares/errorHandling.middleware";
import { deleteAllCacheKeys } from "../../services/redisCache.service";
import { ConflictError } from "../../errors/conflictError";
import { NotFoundError } from "../../errors/notFoundError";
import { SuccessResponse } from "../../types/response";
import { updateVideo } from "../../utils/uploadMedia";
import { Lessons } from "../../models/lesson.models";
import { Videos } from "../../models/video.models";

/**
 * Handler function to update an existing video.
 * @param {Request} req - The request object containing the videoId in params and update data in body.
 * @param {Response} res - The response object used to send a response.
 * @param {NextFunction} next - The next middleware function in the stack.
 * @returns {Promise<void>} - A promise that resolves to void.
 * @throws {NotFoundError} - Throws an error if the video or lesson is not found.
 * @throws {ConflictError} - Throws an error if there are conflicts with the existing video data.
 */
export const updateVideosHandler: RequestHandler<unknown, SuccessResponse> = catchError(
    async (req, res, next) => {
        const { _id } = req.loggedUser;
        const { videoId } = req.params;
        const { title, lessonId, oldPublicId } = req.body;

        const cacheKeys = ['allLessons-*', 'allCourses-*', 'allVideos-*']; // Define cache keys for invalidation

        const video = await Videos.findById(videoId);
        if (!video) return next(new NotFoundError('Video not found'));
        if (video.instructorId.toString() !== _id.toString()) return next(new NotFoundError('Not authorized'));

        // Handle video update
        if (oldPublicId) {
            await updateVideo(req, video, oldPublicId, next)
        }

        // Handle title update
        if (title) {
            if (video.title === title) return next(new ConflictError('Title is the same as the old title'));

            const isUniqueTitle = await Videos.findOne({ instructorId: video.instructorId, title, lessonId: video.lessonId });
            if (isUniqueTitle) return next(new ConflictError('Video title already exists'));

            video.title = title;
        }

        // Handle lesson ID update
        if (lessonId) {
            if (video.lessonId === lessonId) return next(new ConflictError('Lesson ID is the same as the old lesson ID'));

            const lesson = await Lessons.findById(lessonId);
            if (!lesson) return next(new NotFoundError('Lesson not found'));
            if (lesson.instructorId.toString() !== _id.toString()) return next(new NotFoundError('Not authorized'));

            video.lessonId = lessonId;
        }

        await video.save();

        await deleteAllCacheKeys(cacheKeys); // Invalidate related cache keys

        res.status(200).json({
            status: true,
            message: 'Video updated successfully',
            data: video
        });
    }
);
