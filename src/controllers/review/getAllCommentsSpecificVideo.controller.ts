import { RequestHandler } from "express";

import { catchError } from "../../middlewares/errorHandling.middleware";
import { NotAllowedError } from "../../errors/notAllowedError";
import { SuccessResponse } from "../../types/response";
import { Lessons } from "../../models/lesson.models";
import { Reviews } from "../../models/review.models";
import { Courses } from "../../models/course.models";
import { Videos } from "../../models/video.models";
import { Users } from "../../models/user.models";
import { SystemRoles } from "../../types/roles";
import { Enrolled } from "../../models/enrolled.model";

/**
 * Handler to retrieve all comments for a specific video.
 * 
 * This function checks whether the logged-in user has the necessary permissions 
 * to view the comments on a video based on their role (student/teacher) and 
 * enrollment in the course. If the user has access, it fetches the comments and 
 * returns them sorted by creation date.
 * 
 * @route GET /api/videos/:videoId/comments
 * 
 * @param {Request} req - The request object containing videoId in params and user info.
 * @param {Response} res - The response object to return the list of comments.
 * @param {NextFunction} next - The next middleware function for error handling.
 * 
 * @returns {Promise<void>} - A promise that resolves when the comments are successfully retrieved.
 * 
 * @throws {NotAllowedError} - Throws an error if the user is not allowed to view the comments.
 */
export const getAllCommentsSpecificVideoHandler: RequestHandler<
    unknown,
    SuccessResponse
> = catchError(
    async (req, res, next) => {
        const { videoId } = req.params;
        const { _id } = req.loggedUser;

        const video = await Videos.findById(videoId);
        if (!video) return next(new NotAllowedError('Video not found'));

        const lesson = await Lessons.findById(video.lessonId);
        if (!lesson) return next(new NotAllowedError('Lesson not found'));

        const course = await Courses.findById(lesson.courseId);
        if (!course) return next(new NotAllowedError('Course not found'));

        const user = await Users.findById(_id)
        if (!user) return next(new NotAllowedError('User not found'));
        if (user.role === SystemRoles.teacher) {
            if (course?.instructorId.toString() !== _id.toString()) return next(new NotAllowedError('You are not allowed to view comments this video'));
        }
        if (user.role === SystemRoles.student) {
            const enrolledCourse = await Enrolled.findOne({ userId: _id, courseId: course._id });
            if (!enrolledCourse) return next(new NotAllowedError('You are not allowed to view comments this video'));
        }

        const reviews = await Reviews.find({ entityType: 'video', entityId: videoId })
            .populate('userId', 'name profileImage')
            .sort({ createdAt: -1 });

        res.status(200).json({
            status: true,
            message: 'Comments retrieved successfully',
            data: reviews
        });

    }
)