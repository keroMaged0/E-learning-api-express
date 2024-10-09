import { RequestHandler } from "express";

import { catchError } from "../../middlewares/errorHandling.middleware";
import { cloudinaryConnection } from "../../services/cloudinary.service";
import { NotAllowedError } from "../../errors/notAllowedError";
import { NotFoundError } from "../../errors/notFoundError";
import { VerifyReason } from "../../types/verify-reason";
import { SuccessResponse } from "../../types/response";
import { Videos } from "../../models/video.models";
import { Users } from "../../models/user.models";
import { logger } from "../../config/logger";
import { findVideoById } from "../../services/entities/video.service";
import { findUserById } from "../../services/entities/user.service";
import { clearVerifyCode } from "../../services/entities/verifyCode.service";

/**
 * Handler function to confirm the deletion of a video.
 * This function verifies the instructor's identity, checks for a valid
 * verification code, and deletes the video and its associated media
 * from Cloudinary if the checks pass.
 * @param {Request} req - The request object containing the videoId.
 * @param {Response} res - The response object used to send a response.
 * @param {NextFunction} next - The next middleware function in the stack.
 * @returns {Promise<void>} - A promise that resolves to void.
 * @throws {NotFoundError} - Throws an error if the video or user is not found.
 * @throws {NotAllowedError} - Throws an error if the verification code is invalid.
 */
export const confirmDeleteVideosHandler: RequestHandler<unknown, SuccessResponse> = catchError(
    async (req, res, next) => {
        const { videoId } = req.params;
        const { _id: instructorId } = req.loggedUser;

        // Check if the video exists
        const video = await findVideoById(videoId, next);

        // Check if the instructor is authorized to delete the video
        const user = await findUserById(video.instructorId, next);
        if (user._id.toString() !== instructorId.toString())
            return next(new NotFoundError('Unauthorized instructor'));
        if (user.verificationCode?.reason !== VerifyReason.deleteVideo)
            return next(new NotAllowedError('Invalid verification code'));

        // Clear the verification code from the user
        await clearVerifyCode(user)

        // Construct the media path for deletion from Cloudinary
        const mediaPath = video.url.public_id.split(`${video.folderId}`)[0] + video.folderId;

        try {
            // Delete media associated with the video from Cloudinary
            await cloudinaryConnection().api.delete_resources_by_prefix(mediaPath, { resource_type: 'video' });
            await cloudinaryConnection().api.delete_folder(mediaPath);

            // Delete the video from the database
            await Videos.deleteOne({ _id: video._id });

            res.status(200).json({
                status: true,
                message: `Video: (${video.title}) deleted successfully`,
                data: null,
            });
        } catch (error) {
            logger.error(error);
            console.log(error);
            throw new Error("Internal server error while deleting media");
        }
    }
);
