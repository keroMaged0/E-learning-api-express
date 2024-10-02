import { RequestHandler } from "express";

import { catchError } from "../../middlewares/errorHandling.middleware";
import { NotFoundError } from "../../errors/notFoundError";
import { Enrolled } from "../../models/enrolled.model";
import { SuccessResponse } from "../../types/response";
import { Reviews } from "../../models/review.models";
import { Courses } from "../../models/course.models";
import { Lessons } from "../../models/lesson.models";
import { Videos } from "../../models/video.models";

/**
 * Handler to retrieve statistics for a specific course.
 * @param {Request} req - The request object containing the course ID.
 * @param {Response} res - The response object used to send a response.
 * @param {NextFunction} next - The next middleware function in the stack.
 * 
 * @returns {Promise<void>} - A promise that resolves to void.
 * 
 * @throws {NotFoundError} - Throws a NotFoundError if the course is not found or if the user is unauthorized.
 */
export const getCourseStatistics: RequestHandler<unknown, SuccessResponse> = catchError(
    async (req, res, next) => {
        const { _id } = req.loggedUser;
        const { courseId } = req.params;

        const course = await Courses.findById(courseId);
        if (!course) return next(new NotFoundError('Course not found'));
        if (_id.toString() !== course.instructorId.toString())
            return next(new NotFoundError('Unauthorized instructor'));


        // Fetch statistics
        const [
            totalEnrollments,
             totalLessons,
              totalVideos
        ] = await Promise.all([
            Enrolled.countDocuments({ courseId: courseId }),
            Lessons.countDocuments({ courseId }),
            Videos.countDocuments({ lessonId: { $in: course.lessonsId } }),
        ]);

        // Calculate total hours of videos
        const [{ totalHours = 0 } = {}] = await Videos.aggregate([
            { $match: { lessonId: { $in: course.lessonsId } } },
            {
                $group: {
                    _id: null,
                    totalHours: { $sum: '$duration' }
                }
            },
        ]);

        // Determine hours and minutes
        const hours = Math.floor(totalHours / 60);
        const minutes = Math.round(totalHours % 60);

        // Construct totalDuration and unit
        const totalDuration = hours > 0 ? `${hours} hours and ${minutes} minutes` : `${minutes} minutes`;

        // Calculate average rating from reviews
        const reviewStats = await Reviews.aggregate([
            { $match: { entityType: 'course', entityId: courseId } },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: '$rating' }
                }
            }
        ]);
        const averageRating = reviewStats.length > 0 ? reviewStats[0].averageRating : 0;

        // Return success response with the gathered statistics
        return res.status(200).json({
            status: true,
            message: 'Data retrieved successfully',
            data: {
                totalEnrollments,
                totalLessons,
                totalVideos,
                totalDuration,
                averageRating,
            }
        });
    }
);
