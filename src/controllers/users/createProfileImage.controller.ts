import { RequestHandler } from "express";
import { SuccessResponse } from "../../types/response";
import { catchError } from "../../middlewares/errorHandling.middleware";
import { generateCode } from "../../utils/random";
import { env } from "../../config/env";
import { Users } from "../../models/user.models";
import { NotFoundError } from "../../errors/notFoundError";
import { uploadImageToCloudinary } from "../../utils/uploadMedia";

export const createProfileImageHandler: RequestHandler<
    unknown,
    SuccessResponse
> = catchError(
    async (req, res, next) => {
        const { _id } = req.loggedUser

        if (!req.file) return next(new NotFoundError('profile image is required'));

        const user = await Users.findById(_id)
        if (!user) return next(new NotFoundError('User not found'))

        // uniq folder id
        const folderId = generateCode()

        const pathUrl = `${env.cloudinary.baseUrl}/profileImage/${folderId}`

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