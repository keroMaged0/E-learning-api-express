import { RequestHandler } from "express";

import { catchError } from "../../middlewares/errorHandling.middleware";
import { deleteAllCacheKeys } from "../../services/redisCache.service";
import { ConflictError } from "../../errors/conflictError";
import { NotFoundError } from "../../errors/notFoundError";
import { SuccessResponse } from "../../types/response";
import { findUser } from "../../services/user.service";
import { Courses } from "../../models/course.models";
import { generateCode } from "../../utils/random";
import { env } from "../../config/env";
import { uploadImageToCloudinary } from "../../utils/uploadMedia";

/**
 * Handler to create a new course.
 * @param {Request} req - The request object containing course details and the cover image file.
 * @param {Response} res - The response object used to send a response.
 * @param {NextFunction} next - The next middleware function in the stack.
 * @returns {Promise<void>} - A promise that resolves to void.
 * @throws {ConflictError} - Throws an error if the course title already exists.
 * @throws {NotFoundError} - Throws an error if the cover image is not found.
 */
export const createCourseHandler: RequestHandler<
    unknown,
    SuccessResponse,
    { title: string; description: string; price: number }
> = catchError(
    async (req, res, next) => {
        const { _id } = req.loggedUser;
        const cacheKey = 'allCourses-*';

        const user = await findUser(_id);

        // Check for a unique course title for the user
        const isUniqueTitle = await Courses.findOne({ instructorId: _id, title: req.body.title });
        if (isUniqueTitle) return next(new ConflictError('Course title already exists'));

        if (req.file.fieldname !== 'coverImage') return next(new NotFoundError('Cover image not found'));

        // Generate a folder ID for the course
        const folderId = generateCode();
        const pathUrl = `${env.cloudinary.baseUrl}/courses/${folderId}/imageCover`;

        // Upload the cover image to Cloudinary
        const { secure_url, public_id } = await uploadImageToCloudinary(req.file, pathUrl);
        req.folder = pathUrl;

        const course = await Courses.create({
            ...req.body,
            imageCover: {
                secure_url,
                public_id,
            },
            folderId,
            instructorId: user._id,
        });

        // Clear related cache keys for courses
        await deleteAllCacheKeys(cacheKey);

        res.status(201).json({
            status: true,
            message: 'Course created successfully',
            data: {
                course,
            },
        });
    }
);
