import { RequestHandler } from "express";

import { catchError } from "../../middlewares/errorHandling.middleware";
import { uploadImageToCloudinary } from "../../utils/uploadMedia";
import { NotFoundError } from "../../errors/notFoundError";
import { SuccessResponse } from "../../types/response";
import { generateCode } from "../../utils/random";
import { Users } from "../../models/user.models";
import { env } from "../../config/env";

/**
 * Handles the upload and storage of the user's profile image.
 * Requires a file to be included in the request. The image is uploaded to Cloudinary,
 * and the user's profile image data is updated in the database.
 *
 * @param {Request} req - Express request object containing the user's ID and uploaded file.
 * @param {Response} res - Express response object to send the success response.
 * @param {Function} next - Middleware function to handle errors.
 * @returns {Promise<void>} - Sends a success response when the image is added successfully
 * or an error if the image or user is not found.
 */
export const createProfileImageHandler: RequestHandler<
    unknown,
    SuccessResponse
> = catchError(
    async (req, res, next) => {

        const { _id } = req.loggedUser

        // Check if a file is included in the request
        if (!req.file) return next(new NotFoundError('profile image is required'));

        // check if the user exists
        const user = await Users.findById(_id)
        if (!user) return next(new NotFoundError('User not found'))

        // Generate a unique folder ID for the profile image
        const folderId = generateCode()

        // Construct the path URL for storing the image
        const pathUrl = `${env.cloudinary.baseUrl}/profileImage/${folderId}`

        // Upload the image to Cloudinary and retrieve the secure URL and public ID
        const { secure_url, public_id } = await uploadImageToCloudinary(req.file, pathUrl);
        req.folder = pathUrl

        user.profileImage = { secure_url, public_id }
        user.folderId = folderId

        await user.save()

        res.status(200).json({
            status: true,
            message: 'Image added successfully',
            data: {},
        });
    }

)