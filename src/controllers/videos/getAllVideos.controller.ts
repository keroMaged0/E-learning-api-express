import { RequestHandler } from "express";

import { catchError } from "../../middlewares/errorHandling.middleware";
import { findCourseById } from "../../services/entities/course.service";
import { getData, setCache } from "../../services/redisCache.service";
import { NotFoundError } from "../../errors/notFoundError";
import { SuccessResponse } from "../../types/response";
import { Lessons } from "../../models/lesson.models";

/**
 * Handler function to retrieve all videos for a specific course.
 * @param {Request} req - The request object containing the courseId in params.
 * @param {Response} res - The response object used to send a response.
 * @param {NextFunction} next - The next middleware function in the stack.
 * @returns {Promise<void>} - A promise that resolves to void.
 * @throws {NotFoundError} - Throws an error if the course is not found or if the user is not authorized.
 */
export const getAllVideosSpecificCourseHandler: RequestHandler<unknown, SuccessResponse> = catchError(
    async (req, res, next) => {
        const { courseId } = req.params;
        const { _id } = req.loggedUser;

        // Extract pagination and filter parameters from the query
        const { page = 1, limit = 10, sort, search, ...filters } = req.query;
        const cacheKey = `allVideos-${page}-${limit}-${sort}-${JSON.stringify(filters)}-${search || ''}`;

        // Check if data is available in cache
        const cachedData = await getData(cacheKey);
        if (cachedData) {
            return res.status(200).json({
                status: true,
                message: 'Data retrieved from cache successfully',
                data: cachedData,
            });
        }

        // Check if the course exists and the user is the instructor
        const course = await findCourseById(courseId, next);
        if (course.instructorId.toString() !== _id.toString()) {
            return next(new NotFoundError('Not authorized'));
        }

        // Aggregate videos from lessons related to the course
        const videos = await Lessons.aggregate([
            { $match: { _id: { $in: course.lessonsId } } },
            { $unwind: "$videoId" },
            { $lookup: { from: 'videos', localField: "videoId", foreignField: "_id", as: "videoDetails" } },
            { $unwind: "$videoDetails" },
            { $replaceRoot: { newRoot: "$videoDetails" } },
            { $lookup: { from: 'lesson', localField: "lessonId", foreignField: "_id", as: "lessonDetails" } },
            { $lookup: { from: 'users', localField: "instructorId", foreignField: "_id", as: "instructorDetails" } },
            {
                $project: {
                    _id: 1,
                    duration: 1,
                    url: 1,
                    folderId: 1,
                    lessonId: {
                        _id: { $arrayElemAt: ["$lessonDetails._id", 0] },
                        title: { $arrayElemAt: ["$lessonDetails.title", 0] },
                        duration: { $arrayElemAt: ["$lessonDetails.duration", 0] },
                        imageCover: { $arrayElemAt: ["$lessonDetails.imageCover", 0] }
                    },
                    instructorId: {
                        _id: { $arrayElemAt: ["$instructorDetails._id", 0] },
                        name: { $arrayElemAt: ["$instructorDetails.name", 0] },
                    },
                }
            }
        ]);

        // Store the fetched videos in cache
        await setCache(cacheKey, videos);

        res.status(200).json({
            status: true,
            message: 'Videos fetched successfully',
            data: {
                videos
            },
        });
    }
);
