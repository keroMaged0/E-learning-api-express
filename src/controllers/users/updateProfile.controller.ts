import { RequestHandler } from "express";

import { catchError } from "../../middlewares/errorHandling.middleware";
import { uploadImageToCloudinary } from "../../utils/uploadMedia";
import { NotFoundError } from "../../errors/notFoundError";
import { ConflictError } from "../../errors/conflictError";
import { SuccessResponse } from "../../types/response";
import { Users } from "../../models/user.models";
import { env } from "../../config/env";

export const updateProfileHandler: RequestHandler<
    unknown,
    SuccessResponse
> = catchError(
    async (req, res, next) => {
        const { _id } = req.loggedUser
        const { name, gender, oldPublicId } = req.body;

        const user = await Users.findById(_id)
        if (!user) return next(new NotFoundError('User not found'))

        if (name) {
            if (user.name === name) return next(new ConflictError('Conflict Name already exists'))
            user.name = name
        }

        if (gender) {
            if (user.gender === gender) return next(new ConflictError('Gender Gender already exists'))
            user.gender = gender
        }

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