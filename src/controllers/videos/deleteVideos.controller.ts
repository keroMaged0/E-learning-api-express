import { RequestHandler } from "express";

import { catchError } from "../../middlewares/errorHandling.middleware";
import { sendVerifyCode } from "../../services/entities/verifyCode.service";
import { findVideoById } from "../../services/entities/video.service";
import { findUserById } from "../../services/entities/user.service";
import { NotFoundError } from "../../errors/notFoundError";
import { VerifyReason } from "../../types/verify-reason";
import { SuccessResponse } from "../../types/response";

/**
 * Handler function to delete a video.
 * This function checks for the existence of the video and the instructor's authorization,
 * then sends a verification code to the instructor's email to confirm the deletion.
 * @param {Request} req - The request object containing the videoId in params.
 * @param {Response} res - The response object used to send a response.
 * @param {NextFunction} next - The next middleware function in the stack.
 * @returns {Promise<void>} - A promise that resolves to void.
 * @throws {NotFoundError} - Throws an error if the video or user is not found.
 */
export const deleteVideosHandler: RequestHandler<unknown, SuccessResponse> = catchError(
    async (req, res, next) => {
        const { videoId } = req.params;
        const { _id } = req.loggedUser;

        // Check if the video exists
        const video = await findVideoById(videoId, next);

        // Check if the user is the instructor of the video
        const user = await findUserById(video.instructorId, next);
        if (user._id.toString() !== _id.toString()) {
            return next(new NotFoundError('Unauthorized instructor'));
        }

        // Generate and send verification code to the user
        const expireAt = await sendVerifyCode({
            user,
            reason: VerifyReason.deleteVideo,
            subject: `Verification Code to Delete Video: ${video.title}`,
        })

        res.status(200).json({
            status: true,
            message: 'Check your email to confirm video deletion',
            data: expireAt,
        });
    }
);

