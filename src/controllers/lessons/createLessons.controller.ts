import { RequestHandler } from "express";

import { catchError } from "../../middlewares/errorHandling.middleware";
import { deleteAllCacheKeys } from "../../services/redisCache.service";
import { uploadImageToCloudinary } from "../../utils/uploadMedia";
import { findUser } from "../../services/entities/user.service";
import { ConflictError } from "../../errors/conflictError";
import { NotFoundError } from "../../errors/notFoundError";
import { SuccessResponse } from "../../types/response";
import { Courses } from "../../models/course.models";
import { Lessons } from "../../models/lesson.models";
import { generateCode } from "../../utils/random";

/**
 * Handler function to create a new lesson associated with a course.
 * @param {Request} req - The request object containing lesson details and file.
 * @param {Response} res - The response object used to send a response.
 * @param {NextFunction} next - The next middleware function in the stack.
 * @returns {Promise<void>} - A promise that resolves to void.
 * @throws {NotFoundError} - Throws an error if the user or course is not found.
 * @throws {ConflictError} - Throws an error if the lesson title already exists.
 */
export const createLessonsHandler: RequestHandler<
    unknown,
    SuccessResponse
> = catchError(
    async (req, res, next) => {
        const { courseId, title } = req.body;
        const { _id } = req.loggedUser;
        const cacheKeys = ['allLessons-*', 'allCourses-*']; // Cache keys to delete 

        const user = await findUser(_id, next);
        if (!user) return next(new NotFoundError('User not found'));

        const course = await Courses.findOne({ instructorId: user._id, _id: courseId });
        if (!course) return next(new NotFoundError('Course not found'));

        // Check if the lesson title is unique for the instructor
        const isUniqueTitle = await Lessons.findOne({ instructorId: user._id, title: title, courseId: course._id });
        if (isUniqueTitle) return next(new ConflictError('Title already exists'));

        // Validate the cover image presence
        if (req.file.fieldname !== 'coverImage') return next(new NotFoundError('Image cover not found'));

        const folderId = generateCode();
        const pathUrl = course.imageCover.public_id.split('/imageCover')[0] + `/lessons/${folderId}/imageCover`;

        const { secure_url, public_id } = await uploadImageToCloudinary(req.file, pathUrl);
        req.folder = pathUrl;

        const lesson = await Lessons.create({
            ...req.body,
            imageCover: {
                secure_url,
                public_id
            },
            folderId,
            instructorId: user._id
        });

        // Associate the lesson with the course and update the course's lessonsId array
        await Courses.findByIdAndUpdate(courseId, { $push: { lessonsId: lesson._id } });

        // Delete all cache keys related to lessons and courses
        await Promise.all(cacheKeys.map(cacheKey => deleteAllCacheKeys(cacheKey)));

        res.status(201).json({
            status: true,
            message: 'Lesson created successfully',
            data: {
                lesson
            },
        });
    }
);
