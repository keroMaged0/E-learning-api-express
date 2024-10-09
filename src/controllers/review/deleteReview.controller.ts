import { RequestHandler } from "express";

import { sendVerifyCode } from "../../services/entities/verifyCode.service";
import { catchError } from "../../middlewares/errorHandling.middleware";
import { findReview } from "../../services/entities/review.service";
import { findUserById } from "../../services/entities/user.service";
import { VerifyReason } from "../../types/verify-reason";
import { SuccessResponse } from "../../types/response";

/**
 * Handler to delete a specific review by its ID for the logged-in user.
 * 
 * This function sends a verification code to the user's email to confirm the deletion of their review.
 * 
 * @route DELETE /api/reviews/:reviewId
 * 
 * @param {Request} req - The request object containing the review ID and user info.
 * @param {Response} res - The response object to return a success message.
 * @param {NextFunction} next - The next middleware function for error handling.
 * 
 * @returns {Promise<void>} - A promise that resolves when the verification code is sent successfully.
 * 
 * @throws {NotFoundError} - Throws an error if the review or user is not found.
 */
export const deleteReviewHandler: RequestHandler<
    unknown,
    SuccessResponse
> = catchError(
    async (req, res, next) => {
        const { reviewId } = req.params;
        const { _id } = req.loggedUser;

        // Check if the review exists
        await findReview({ _id: reviewId, userId: _id }, next);

        // Check if the user is enrolled in the course 
        const user = await findUserById(_id, next);

        // Generate a verification code for deletion confirmation
        const expireAt = await sendVerifyCode({
            user,
            reason: VerifyReason.deleteReview,
            subject: `Verification code to delete your review`,
        })

        res.status(200).json({
            status: true,
            message: 'Check your email to confirm review deletion',
            data: expireAt,
        });
    }
)