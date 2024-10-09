import { RequestHandler } from "express";

import { catchError } from "../../middlewares/errorHandling.middleware";
import { findLessonById } from "../../services/entities/lesson.service";
import { findCourseById } from "../../services/entities/course.service";
import { ConflictError } from "../../errors/conflictError";
import { NotFoundError } from "../../errors/notFoundError";
import { SuccessResponse } from "../../types/response";
import { updateImage } from "../../utils/uploadMedia";
import { Lessons } from "../../models/lesson.models";

/**
 * Handler to update an existing lesson.
 * @param {Request} req - The request object containing lesson details and the cover image file.
 * @param {Response} res - The response object used to send a response.
 * @param {NextFunction} next - The next middleware function in the stack.
 * @returns {Promise<void>} - A promise that resolves to void.
 * @throws {NotFoundError} - Throws an error if the lesson or course is not found.
 * @throws {ConflictError} - Throws an error if the lesson title already exists or if the instructor is unauthorized.
 */
export const updateLessonsHandler: RequestHandler<unknown, SuccessResponse> = catchError(
    async (req, res, next) => {
        const { lessonId } = req.params;
        const { _id } = req.loggedUser;
        const { title, courseId, oldPublicId } = req.body;

        // Check if the lesson exists
        const lesson = await findLessonById(lessonId, next);

        // Check if the course exists
        await findCourseById(lesson.courseId, next);

        // Check if the instructor is authorized to update the lesson
        if (lesson.instructorId.toString() !== _id.toString()) {
            return next(new NotFoundError('Unauthorized instructor'));
        }

        // Handle cover image upload if provided
        if (oldPublicId) {
            await updateImage(req, lesson, oldPublicId, next);
        }

        // Update lesson fields if provided
        if (title) {
            if (lesson.title === title) return next(new ConflictError('Title is the same as the old title'));

            const isUniqueTitle = await Lessons.findOne({ instructorId: lesson.instructorId, title, courseId });
            if (isUniqueTitle) return next(new ConflictError('Lesson title already exists'));

            lesson.title = title;
        }

        if (courseId) {
            if (lesson.courseId.toString() === courseId) return next(new ConflictError('Course ID is the same as the old Course ID'));

            const newCourse = await findCourseById(courseId, next);
            if (newCourse.instructorId.toString() !== _id.toString()) return next(new NotFoundError('Unauthorized instructor'));

            // Update course lessons
            newCourse.lessonsId = newCourse.lessonsId.filter((id) => id.toString() !== lesson.id);
            newCourse.lessonsId.push(lessonId);
            await newCourse.save();
            lesson.courseId = courseId;
        }

        await lesson.save();

        res.status(200).json({
            status: true,
            message: 'Lesson updated successfully',
            data: lesson,
        });
    }
);

