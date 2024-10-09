import { RequestHandler } from "express";

import { catchError } from "../../middlewares/errorHandling.middleware";
import { NotFoundError } from "../../errors/notFoundError";
import { SuccessResponse } from "../../types/response";
import { Reviews } from "../../models/review.models";
import { MODELS } from "../../types/modelNames";
import { findReview } from "../../services/entities/review.service";

/**
 * Handler to update a specific review by its ID for the logged-in user.
 * 
 * This function checks if the review belongs to the logged-in user before updating it.
 * 
 * @route PUT /api/reviews/:reviewId
 * 
 * @param {Request} req - The request object containing the review ID, user info, and updated data.
 * @param {Response} res - The response object to return the updated review data.
 * @param {NextFunction} next - The next middleware function for error handling.
 * 
 * @returns {Promise<void>} - A promise that resolves when the review is successfully updated.
 * 
 * @throws {NotFoundError} - Throws an error if the review is not found.
 * @throws {NotAllowedError} - Throws an error if the comment or rating is missing.
 */
export const updateReviewHandler: RequestHandler<
    unknown,
    SuccessResponse
> = catchError(
    async (req, res, next) => {
        const { reviewId } = req.params;
        const { _id } = req.loggedUser;
        const { rating, comment } = req.body;

        // Check if the review exists
        const review = await findReview({ _id: reviewId, userId: _id }, next)

        if (review.entityType === MODELS.course) {
            if (!comment) return next(new NotFoundError('Comment not found'));
            review.comment = comment;
        }

        if (review.entityType === MODELS.video) {
            if (!rating) return next(new NotFoundError('Rating not found'));
            review.rating = rating;
        }

        await review.save();
        res.status(200).json({
            status: true,
            message: 'Review updated successfully',
            data: review
        });
    }
)