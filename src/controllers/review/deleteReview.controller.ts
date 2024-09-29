import { RequestHandler } from "express";

import { catchError } from "../../middlewares/errorHandling.middleware";
import { NotFoundError } from "../../errors/notFoundError";
import { VerifyReason } from "../../types/verify-reason";
import { SuccessResponse } from "../../types/response";
import { Reviews } from "../../models/review.models";
import { mailTransporter } from "../../utils/mail";
import { generateCode } from "../../utils/random";
import { Users } from "../../models/user.models";
import { hashCode } from "../../utils/crypto";

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

        const review = await Reviews.findOne({ _id: reviewId, userId: _id });
        if (!review) return next(new NotFoundError('Review not found'));

        const user = await Users.findById(_id);
        if (!user) return next(new NotFoundError('User not found'));

        const code = generateCode();
        user.verificationCode = {
            code: hashCode(code),
            expireAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes expiration
            reason: VerifyReason.deleteReview,
            tempEmail: null,
        };

        // Send the verification code via email
        await mailTransporter.sendMail({
            to: user.email,
            subject: `Verification code to delete your review`,
            html: `Verification code: <strong>${code}</strong>`,
        });

        await user.save();

        res.status(200).json({
            status: true,
            message: 'Check your email to confirm review deletion',
            data: null,
        });
    }
)