import { RequestHandler } from "express";

import { catchError } from "../../middlewares/errorHandling.middleware";
import { getData, setCache } from "../../services/redisCache.service";
import { NotFoundError } from "../../errors/notFoundError";
import { SuccessResponse } from "../../types/response";
import { Lessons } from "../../models/lesson.models";
import { Courses } from "../../models/course.models";
import { ApiFeature } from "../../utils/apiFeature";

/**
 * Handler to retrieve all lessons with pagination, sorting, and filtering.
 * @param {Request} req - The request object containing query parameters for pagination, sorting, searching, and filtering.
 * @param {Response} res - The response object used to send a response.
 * @param {NextFunction} next - The next middleware function in the stack.
 * @returns {Promise<void>} - A promise that resolves to void.
 * @throws {NotFoundError} - Throws an error if the course is not found.
 */
export const getAllLessonsHandler: RequestHandler<
    unknown,
    SuccessResponse
> = catchError(
    async (req, res, next) => {
        const { courseId } = req.params;
        const { page = 1, limit = 10, sort, search, ...filters } = req.query;
        const cacheKey = `allLessons-${page}-${limit}-${sort}-${JSON.stringify(filters)}-${search || ''}`;

        const cachedData = await getData(cacheKey);
        // Check if data is available in cache
        if (cachedData) {
            return res.status(200).json({
                status: true,
                message: 'Data retrieved from cache successfully',
                data: cachedData,
            });
        }

        const course = await Courses.findById(courseId);
        if (!course) return next(new NotFoundError('Course not found'));

        const apiFeature = new ApiFeature(Lessons.find({ courseId: course._id }), req.query)
            .paginate()
            .sort()
            .filter()
            .search();

        const lessons = await apiFeature.query
            .populate([
                { path: 'instructorId', select: 'name' },
                { path: 'courseId' },
                { path: 'videoId' }
            ]);

        await setCache(cacheKey, lessons);

        res.status(200).json({
            status: true,
            message: 'Data retrieved successfully',
            data: lessons
        });
    }
);
