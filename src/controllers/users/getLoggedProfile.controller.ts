import { RequestHandler } from "express";

import { catchError } from "../../middlewares/errorHandling.middleware";
import { NotFoundError } from "../../errors/notFoundError";
import { SuccessResponse } from "../../types/response";
import { Users } from "../../models/user.models";

/**
 * Retrieves the logged-in user's profile information.
 * Excludes sensitive fields such as password, tokens, and verification code from the response.
 *
 * @param {Request} req - Express request object containing the logged-in user's ID.
 * @param {Response} res - Express response object to send the user profile data.
 * @param {Function} next - Middleware function to handle errors.
 * @returns {Promise<void>} - Sends a success response with the user's profile data or an error if the user is not found.
 */
export const getLoggedProfileHandler: RequestHandler<
    unknown,
    SuccessResponse
> = catchError(
    async (req, res, next) => {
        const { _id } = req.loggedUser;

        // get user profile
        const user = await Users.findById(_id).select('-password -__v -verificationCode -accessToken -refreshToken -folderId ');;
        if (!user) return next(new NotFoundError('user not found'));

        res.status(200).json({
            status: true,
            message: 'User retrive successfully',
            data: user,
        });
    }
)