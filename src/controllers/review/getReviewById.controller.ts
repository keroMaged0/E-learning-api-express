import { RequestHandler } from "express";

import { catchError } from "../../middlewares/errorHandling.middleware";
import { NotAllowedError } from "../../errors/notAllowedError";
import { SuccessResponse } from "../../types/response";
import { Reviews } from "../../models/review.models";
import { findReview } from "../../services/entities/review.service";

/**
 * Handler to retrieve a specific review by its ID for the logged-in user.
 * 
 * This function checks if the review belongs to the logged-in user before fetching it.
 * 
 * @route GET /api/reviews/:reviewId
 * 
 * @param {Request} req - The request object containing the review ID and user info.
 * @param {Response} res - The response object to return the review data.
 * @param {NextFunction} next - The next middleware function for error handling.
 * 
 * @returns {Promise<void>} - A promise that resolves when the review is successfully retrieved.
 * 
 * @throws {NotFoundError} - Throws an error if the review is not found.
 */
export const getReviewByIdHandler: RequestHandler<
    unknown,
    SuccessResponse
> = catchError(
    async (req, res, next) => {
        const { reviewId } = req.params;
        const { _id } = req.loggedUser;

        // Check if the review exists
        const review = await findReview({ userId: _id, _id: reviewId }, next)

        return res.status(200).json({
            status: true,
            message: 'data retrieved',
            data: review,
        });
    }
)