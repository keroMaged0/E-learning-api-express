import { RequestHandler } from "express";

import { catchError } from "../../middlewares/errorHandling.middleware";
import { NotAllowedError } from "../../errors/notAllowedError";
import { NotFoundError } from "../../errors/notFoundError";
import { VerifyReason } from "../../types/verify-reason";
import { SuccessResponse } from "../../types/response";
import { Reviews } from "../../models/review.models";
import { Users } from "../../models/user.models";

/**
 * Handler to confirm the deletion of a specific review by its ID for the logged-in user.
 * This function verifies the user's identity and the verification code before deleting the review.
 * 
 * @route DELETE /api/reviews/:reviewId/confirm
 * 
 * @param {Request} req - The request object containing the review ID and user info.
 * @param {Response} res - The response object to return a success message.
 * @param {NextFunction} next - The next middleware function for error handling.
 * 
 * @returns {Promise<void>} - A promise that resolves when the review is deleted successfully.
 * 
 * @throws {NotFoundError} - Throws an error if the review or user is not found.
 * @throws {NotAllowedError} - Throws an error if the verification code is invalid.
 */
export const confirmDeleteReviewHandler: RequestHandler<
    unknown,
    SuccessResponse
> = catchError(
    async (req, res, next) => {
        const { reviewId } = req.params;
        const { _id } = req.loggedUser;

        const review = await Reviews.findOne({ _id: reviewId, userId: _id });
        if (!review) return next(new NotFoundError('Review not found'));

        // Ensure the instructor exists and is authorized to delete the course
        const user = await Users.findById({ _id: review.userId });
        if (!user) return next(new NotFoundError('User not found'));
        if (user._id.toString() !== _id.toString()) {
            return next(new NotFoundError('Unauthorized instructor'));
        }
        if (user.verificationCode?.reason !== VerifyReason.deleteReview) {
            return next(new NotAllowedError('Invalid verification code'));
        }
        user.verificationCode.reason = null;
        await user.save();

        await review.deleteOne({ _id: reviewId });

        res.status(200).json({
            status: true,
            message: 'Review deleted successfully',
            data: null
        });

    }
)