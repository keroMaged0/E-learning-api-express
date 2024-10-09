import { RequestHandler } from "express";

import { generateAccessToken, generateRefreshToken, generateTempToken } from "../../utils/token";
import { catchError } from "../../middlewares/errorHandling.middleware";
import { findUser } from "../../services/entities/user.service";
import { NotAllowedError } from "../../errors/notAllowedError";
import { NotFoundError } from "../../errors/notFoundError";
import { SuccessResponse } from "../../types/response";
import { comparePassword } from "../../utils/bcrypt";


/**
 * Handles user sign-in by validating user credentials, generating tokens, and returning authentication details.
 *
 * @param {Request} req - Express request object containing user credentials (email and password).
 * @param {Response} res - Express response object for sending the response to the client.
 * @param {Function} next - Middleware function to handle errors.
 * @returns {Promise<void>} - Sends a JSON response with authentication tokens or error messages.
 */
export const signInHandler: RequestHandler<
    unknown,
    SuccessResponse,
    { email: string; password: string }
> = catchError(
    async (req, res, next) => {
        const { email, password } = req.body;

        // check if user exist
        const user = await findUser(email, next)

        // check if password is correct
        const isMatch = await comparePassword(password, user?.password || '')
        if (!isMatch) return next(new NotFoundError('password mismatch or not correct email'));

        // check if user is verified
        if (!user.isVerified) return next(new NotAllowedError('please verify your Email and try again'));

        // check if user two-factor authentication is enabled
        if (user['2faEnabled']) {
            const tempTokenData = await generateTempToken(user._id.toString());
            return res.status(200).json({
                message: 'Two Factor Authentication enabled',
                status: true,
                data: {
                    token: tempTokenData,
                },
            });
        }

        // create token
        const accessToken = await generateAccessToken();
        const refreshToken = await generateRefreshToken();

        user.accessToken = accessToken;
        user.refreshToken = refreshToken;

        await user.save();

        res.status(200).json({
            message: 'success',
            status: true,
            data: {
                token: {
                    accessToken: accessToken as string,
                    refreshToken: user.refreshToken as string,
                },
            },
        });

    }
)