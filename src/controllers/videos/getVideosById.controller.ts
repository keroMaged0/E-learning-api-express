import { RequestHandler } from "express";

import { catchError } from "../../middlewares/errorHandling.middleware";
import { SuccessResponse } from "../../types/response";
import { Videos } from "../../models/video.models";
import { NotFoundError } from "../../errors/notFoundError";

/**
 * Handler function to retrieve a video by its ID.
 * @param {Request} req - The request object containing the videoId in params.
 * @param {Response} res - The response object used to send a response.
 * @param {NextFunction} next - The next middleware function in the stack.
 * @returns {Promise<void>} - A promise that resolves to void.
 * @throws {NotFoundError} - Throws an error if the video is not found or if the user is not authorized.
 */
export const getVideosByIdHandler: RequestHandler<unknown, SuccessResponse> = catchError(
    async (req, res, next) => {
        const { videoId } = req.params; 
        const { _id } = req.loggedUser; 

        // Find the video by ID and populate related instructor and lesson details
        const video = await Videos.findById(videoId).populate([
            { path: 'instructorId' },
            { path: 'lessonId' }
        ]);
        if (!video) return next(new NotFoundError('Video not found'));
        if (video.instructorId.toString() !== _id.toString()) {
            return next(new NotFoundError('Not authorized'));
        }
        res.status(200).json({
            status: true,
            message: 'Data retrieved successfully',
            data: video
        });
    }
);
