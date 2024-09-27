import { RequestHandler } from "express";

import { catchError } from "../../middlewares/errorHandling.middleware";
import { SuccessResponse } from "../../types/response";
import { generateCode } from "../../utils/random";
import { hashCode } from "../../utils/crypto";
import { VerifyReason } from "../../types/verify-reason";
import { mailTransporter } from "../../utils/mail";
import { Videos } from "../../models/video.models";
import { NotFoundError } from "../../errors/notFoundError";
import { Users } from "../../models/user.models";

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

        const video = await Videos.findById(videoId);
        if (!video) return next(new NotFoundError('Video not found'));

        const user = await Users.findById(video.instructorId);
        if (!user) return next(new NotFoundError('User not found'));
        if (user._id.toString() !== _id.toString()) {
            return next(new NotFoundError('Unauthorized instructor'));
        }

        // Generate and send verification code to the user
        await generateAndSendVerificationCode(user, video.title);
        
        res.status(200).json({
            status: true,
            message: 'Check your email to confirm video deletion',
            data: null,
        });
    }
);

/**
 * Generate a verification code and send it to the user's email.
 * @param {User} user - The user object to send the verification code to.
 * @param {string} videoTitle - The title of the video being deleted.
 * @returns {Promise<void>} - A promise that resolves to void.
 */
const generateAndSendVerificationCode = async (user, videoTitle: string) => {
    const code = generateCode(); 

    // Set the verification code details in the user's object
    user.verificationCode = {
        code: hashCode(code), 
        expireAt: new Date(Date.now() + 10 * 60 * 1000), 
        reason: VerifyReason.deleteVideo, 
        tempEmail: null,
    };

    // Send verification code to the user's email
    await mailTransporter.sendMail({
        to: user.email,
        subject: `Verification Code to Delete Video: ${videoTitle}`,
        html: `Your verification code is <strong>${code}</strong>`, 
    });

    await user.save();
};
