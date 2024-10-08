import { RequestHandler } from "express";

import { catchError } from "../../middlewares/errorHandling.middleware";
import { uploadImageToCloudinary } from "../../utils/uploadMedia";
import { NotFoundError } from "../../errors/notFoundError";
import { ConflictError } from "../../errors/conflictError";
import { SuccessResponse } from "../../types/response";
import { Users } from "../../models/user.models";
import { env } from "../../config/env";

/**
 * Handles the updating of a user's profile information.
 * This includes updating the user's name, gender, and profile image.
 * If the profile image is updated, it uploads the new image to Cloudinary.
 *
 * @param {Request} req - Express request object containing the user's ID and update data.
 * @param {Response} res - Express response object to send the success response.
 * @param {Function} next - Middleware function to handle errors.
 * @returns {Promise<void>} - Sends a success response when the profile is updated successfully
 * or an error if the user is not found or conflicts occur.
 */
export const updateProfileHandler: RequestHandler<
    unknown,
    SuccessResponse
> = catchError(
    async (req, res, next) => {
        const { name, gender, oldPublicId } = req.body;
        const { _id } = req.loggedUser

        const user = await Users.findById(_id)
        if (!user) return next(new NotFoundError('User not found'))

        // Update the user's name if provided
        if (name) {
            if (user.name === name) return next(new ConflictError('Conflict Name already exists'))
            user.name = name
        }

        // Update the user's gender if provided
        if (gender) {
            if (user.gender === gender) return next(new ConflictError('Gender Gender already exists'))
            user.gender = gender
        }

        // Update the user's profile image if oldPublicId is provided
        if (oldPublicId) {
            if (!req.file) return next(new NotFoundError('profileImage is required'))

            const newPublicId = oldPublicId.split(`${user.folderId}/`)[1]
            const pathUrl = `${env.cloudinary.baseUrl}/profileImage/${user.folderId}`

            const { secure_url } = await uploadImageToCloudinary(req.file, pathUrl, newPublicId);

            user.profileImage.secure_url = secure_url
        }

        await user.save();

        res.status(200).json({
            status: true,
            message: 'Profile updated successfully',
            data: {}
        });

    }
)   