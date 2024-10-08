import { RequestHandler } from "express";

import { catchError } from "../../middlewares/errorHandling.middleware";
import { getData, setCache } from "../../services/redisCache.service";
import { SuccessResponse } from "../../types/response";
import { Courses } from "../../models/course.models";
import { ApiFeature } from "../../utils/apiFeature";
import { logger } from "../../config/logger";

/**
 * Handler to retrieve all courses with pagination, sorting, and filtering. 
 * @param {Request} req - The request object containing pagination and filter parameters.
 * @param {Response} res - The response object used to send a response.
 * @param {NextFunction} next - The next middleware function in the stack.
 * @returns {Promise<void>} - A promise that resolves to void.
 * @throws {Error} - Throws an error if there is an internal server error.
 */
export const getAllCoursesHandler: RequestHandler<
    unknown,
    SuccessResponse
> = catchError(
    async (req, res, next) => {
        const { page = 1, limit = 10, sort, search, ...filters } = req.query;
        const cacheKey = `allCourses-${page}-${limit}-${sort}-${JSON.stringify(filters)}-${search || ''}`;

        // Check if data is available in cache
        const cachedData = await getData(cacheKey);
        if (cachedData) {
            return res.status(200).json({
                status: true,
                message: 'Data retrieved from cache successfully',
                data: cachedData,
            });
        }

        try {
            const apiFeature = new ApiFeature(Courses.find(), req.query)
                .paginate()
                .sort()
                .filter()
                .search();

            // Fetch courses with populated fields
            const courses = await apiFeature.query.populate([
                { path: 'instructorId', select: 'name' },
                { path: 'lessonsId' },
                { path: 'ratingId'} 
            ]);

            // Cache the retrieved courses for future requests
            await setCache(cacheKey, courses);

            res.status(200).json({
                status: true,
                message: 'Data retrieved successfully',
                data: courses,
            });
        } catch (error) {
            logger.error(error);
            // Handle internal server error
            return res.status(500).json({
                status: false,
                message: 'Internal server error',
                error: error,
            });
        }
    }
);
