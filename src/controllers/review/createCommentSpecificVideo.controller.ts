import { RequestHandler } from "express";

import { catchError } from "../../middlewares/errorHandling.middleware";
import { findLessonById } from "../../services/entities/lesson.service";
import { findCourseById } from "../../services/entities/course.service";
import { findVideoById } from "../../services/entities/video.service";
import { NotAllowedError } from "../../errors/notAllowedError";
import { Enrolled } from "../../models/enrolled.model";
import { SuccessResponse } from "../../types/response";
import { Reviews } from "../../models/review.models";
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

        // Check if the video exists
        const video = await findVideoById(videoId, next);

        // Check if the lesson exists
        const lesson = await findLessonById(video.lessonId, next);

        // Check if the course exists
        const course = await findCourseById(lesson.courseId, next);

        // Check if user have permission to review the entity
        const enrolled = await Enrolled.findOne({ userId: _id, courseId: course._id });
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