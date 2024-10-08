import { RequestHandler } from "express";

import { catchError } from "../../middlewares/errorHandling.middleware";
import { ConflictError } from "../../errors/conflictError";
import { NotFoundError } from "../../errors/notFoundError";
import { SuccessResponse } from "../../types/response";
import { Courses } from "../../models/course.models";
import { updateImage } from "../../utils/uploadMedia";

/**
 * Handler to update an existing course.
 * @param {Request} req - The request object containing the course ID and update data.
 * @param {Response} res - The response object used to send a response.
 * @param {NextFunction} next - The next middleware function in the stack.
 * 
 * @returns {Promise<void>} - A promise that resolves to void.
 * 
 * @throws {NotFoundError} - Throws a NotFoundError if the course is not found.
 * @throws {ConflictError} - Throws a ConflictError for validation issues.
 */
export const updateCourseHandler: RequestHandler<
    unknown,
    SuccessResponse
> = catchError(
    async (req, res, next) => {
        const { courseId } = req.params;
        const { _id } = req.loggedUser;
        const { title, description, price, oldPublicId } = req.body;

        // Check if the course exists and the instructor is authorized
        const course = await Courses.findById({ _id: courseId });
        if (!course) return next(new NotFoundError('Course not found'));
        if (course.instructorId.toString() !== _id.toString())
            return next(new NotFoundError('Unauthorized instructor'));


        // Handle cover image update
        if (oldPublicId) {
            await updateImage(req, course, oldPublicId, next);
        }

        // Update title if provided
        if (title) {
            if (course.title === title) return next(new ConflictError('Title is the same as the old title'));

            // Check for unique title among instructor's courses
            const isUniqueTitle = await Courses.findOne({ instructorId: course.instructorId, title: title });
            if (isUniqueTitle) return next(new ConflictError('Course title already exists'));

            course.title = title;
        }

        // Update description if provided
        if (description) {
            if (course.description === description) return next(new ConflictError('Course description is the same as the old description'));
            course.description = description;
        }

        // Update price if provided
        if (price) {
            if (course.price === price) return next(new ConflictError('Course price is the same as the old price'));
            course.price = price;
        }

        await course.save();

        res.status(200).json({
            status: true,
            message: 'Course updated successfully',
            data: course,
        });
    }
);
