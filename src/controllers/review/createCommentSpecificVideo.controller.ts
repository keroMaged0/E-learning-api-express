import { RequestHandler } from "express";

import { catchError } from "../../middlewares/errorHandling.middleware";
import { EnrolledCourse } from "../../models/enrolledCourse.models";
import { NotAllowedError } from "../../errors/notAllowedError";
import { SuccessResponse } from "../../types/response";
import { Reviews } from "../../models/review.models";
import { Courses } from "../../models/course.models";
import { Lessons } from "../../models/lesson.models";
import { Videos } from "../../models/video.models";
import { MODELS } from "../../types/modelNames";

/**
 * Handler to create a comment on a specific video.
 * 
 * This function allows users who are enrolled in a course to comment on a video
 * within that course. It validates the video, lesson, and course existence, 
 * checks if the user is enrolled, and then allows the user to post a comment.
 * 
 * @route POST /api/videos/:videoId/comment
 * 
 * @param {Request} req - The request object containing videoId in the params and comment in the body.
 * @param {Response} res - The response object used to send the success message.
 * @param {NextFunction} next - The next middleware function for error handling.
 * 
 * @returns {Promise<void>} - A promise that resolves when the comment is successfully created.
 * 
 * @throws {NotAllowedError} - Throws an error if the video, lesson, or course is not found, or if the user is not enrolled.
 */
export const createCommentSpecificVideoHandler: RequestHandler<
    unknown,
    SuccessResponse
> = catchError(
    async (req, res, next) => {
        const { _id } = req.loggedUser;
        const { comment } = req.body;
        const { videoId } = req.params;

        const video = await Videos.findById(videoId);
        if (!video) return next(new NotAllowedError('Video not found'));

        const lesson = await Lessons.findById(video.lessonId);
        if (!lesson) return next(new NotAllowedError('Lesson not found'));

        const course = await Courses.findById(lesson.courseId);
        if (!course) return next(new NotAllowedError('Course not found'));

        // Check if user have permission to review the entity
        const enrolled = await EnrolledCourse.findOne({ userId: _id, courseId: course._id });
        if (!enrolled) {
            return next(new NotAllowedError('You are not allowed to comment this video'));
        }

        const review = new Reviews({
            userId: _id,
            entityId: video._id,
            entityType: MODELS.video,
            comment,
        });

        await review.save();

        res.status(200).json({
            status: true,
            message: `Created comment successfully`,
            data: null,
        });
    }
)