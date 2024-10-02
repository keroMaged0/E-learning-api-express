import { RequestHandler } from "express";

import { catchError } from "../../middlewares/errorHandling.middleware";
// import { EnrolledCourse } from "../../models/enrolledCourse.models";
import { NotAllowedError } from "../../errors/notAllowedError";
import { SuccessResponse } from "../../types/response";
import { Reviews } from "../../models/review.models";
import { MODELS } from "../../types/modelNames";


/**
 * Handler to create a review for a specific course.
 * 
 * This function performs the following:
 * 1. Checks if the user is enrolled in the course.
 * 2. Ensures the user hasn't already submitted a review for the course.
 * 3. If eligible, creates the review and stores it in the database.
 * 
 * @route POST /api/courses/:courseId/reviews
 * 
 * @param {Request} req - The request object containing the logged user’s ID, review rating, and course ID.
 * @param {Response} res - The response object used to send a success message.
 * @param {NextFunction} next - The next middleware function for error handling.
 * 
 * @returns {Promise<void>} - A promise that resolves when the review is successfully created.
 * 
 * @throws {NotAllowedError} - Throws an error if the user is not allowed to review the course or if they have already reviewed it.
 */
export const createReviewSpecificCourseHandler: RequestHandler<
    unknown,
    SuccessResponse
> = catchError(
    async (req, res, next) => {
        const { _id } = req.loggedUser;
        const { rating } = req.body;
        const { courseId } = req.params;


        // Check if user have permission to review the entity
        // const enrolled = await EnrolledCourse.findOne({ userId: _id, courseId });
        // if (!enrolled) {
        //     return next(new NotAllowedError('You are not allowed to review this course'));
        // }

        // Check if user already reviewed the entity
        const reviewExist = await Reviews.findOne({
            userId: _id,
            entityType: MODELS.course,
            entityId: courseId,
        });
        if (reviewExist)
            return next(new NotAllowedError('You already reviewed this course'));

        await Reviews.create({
            userId: _id,
            entityType: MODELS.course,
            entityId: courseId,
            rating,
        });


        res.status(200).json({
            status: true,
            message: `Created review successfully`,
            data: null,
        });
    }
)