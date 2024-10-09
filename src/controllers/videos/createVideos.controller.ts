import { RequestHandler } from "express";

import { catchError } from "../../middlewares/errorHandling.middleware";
import { deleteAllCacheKeys } from "../../services/redisCache.service";
import { findLesson } from "../../services/entities/lesson.service";
import { uploadVideoToCloudinary } from "../../utils/uploadMedia";
import { SuccessResponse } from "../../types/response";
import { Lessons } from "../../models/lesson.models";
import { Videos } from "../../models/video.models";
import { generateCode } from "../../utils/random";

/**
 * Handler function to create a new video associated with a lesson.
 * This function checks for the existence of the lesson, uploads the video to Cloudinary,
 * and updates the lesson with the new video. It also clears the relevant cache keys
 * to ensure data consistency.
 * @param {Request} req - The request object containing the lessonId and file.
 * @param {Response} res - The response object used to send a response.
 * @param {NextFunction} next - The next middleware function in the stack.
 * @returns {Promise<void>} - A promise that resolves to void.
 * @throws {NotFoundError} - Throws an error if the lesson is not found.
 */
export const createVideosHandler: RequestHandler<unknown, SuccessResponse> = catchError(
    async (req, res, next) => {
        const { lessonId } = req.body;
        const { _id } = req.loggedUser;
        const cacheKeys = ['allLessons-*', 'allCourses-*', 'allVideos-*']; // Cache keys to invalidate

        // Find the lesson by instructor ID
        const lesson = await findLesson({ instructorId: _id, _id: lessonId }, next);

        const folderId = generateCode();
        const pathUrl = lesson.imageCover.public_id.split(`${lesson.folderId}/imageCover`)[0] + `${lesson.folderId}/videos/${folderId}`;

        const { secure_url, public_id, duration }: any = await uploadVideoToCloudinary(req.file, pathUrl);

        const formattedDuration = formatDuration(duration);

        const lessonDuration = lesson.duration

        console.log(lessonDuration);


        const video = await Videos.create({
            ...req.body,
            url: {
                secure_url,
                public_id
            },
            duration: formattedDuration,
            folderId,
            instructorId: _id,
            lessonId
        });

        // Update the lesson to include the new video ID
        await Lessons.findByIdAndUpdate(lessonId, { $push: { videoId: video._id } });

        // Invalidate the relevant cache keys to ensure data consistency
        await Promise.all(cacheKeys.map(cacheKey => deleteAllCacheKeys(cacheKey)));

        res.status(201).json({
            status: true,
            message: 'Video created successfully',
            data: {
                video
            },
        });
    }
);



/**
 * Function to convert duration in seconds to HH:mm:ss format
 * @param {number} durationInSeconds - The duration in seconds
 * @returns {string} - The formatted duration as HH:mm:ss
 */
export const formatDuration = (durationInSeconds: number): string => {
    const hours = Math.floor(durationInSeconds / 3600);
    const minutes = Math.floor((durationInSeconds % 3600) / 60);
    const seconds = Math.floor(durationInSeconds % 60);

    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');

    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
};