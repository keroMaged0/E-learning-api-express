import { RequestHandler } from "express";

import { catchError } from "../../middlewares/errorHandling.middleware";
import { SuccessResponse } from "../../types/response";
import { Reviews } from "../../models/review.models";


/**
 * Handler to retrieve all reviews made by a specific logged-in user.
 * 
 * This function fetches all reviews created by the logged-in user (identified by _id).
 * 
 * @route GET /api/users/reviews
 * 
 * @param {Request} req - The request object containing user info.
 * @param {Response} res - The response object to return the list of reviews.
 * @param {NextFunction} next - The next middleware function for error handling.
 * 
 * @returns {Promise<void>} - A promise that resolves when the reviews are successfully retrieved.
 * 
 * @throws {NotFoundError} - Throws an error if no reviews are found for the user.
 */
export const getAllReviewsSpecificUserHandler: RequestHandler<
    unknown,
    SuccessResponse
> = catchError(
    async (req, res, next) => {
        const { _id } = req.loggedUser;

        const reviews = await Reviews.find({ userId: _id })
        if (!reviews) return next(new Error('Reviews not found'));

        return res.status(200).json({
            status: true,
            message: 'data retrieved successfully',
            data: reviews
        });
    }
)