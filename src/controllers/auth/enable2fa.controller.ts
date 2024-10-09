import { RequestHandler } from "express";
import { authenticator } from "otplib";

import { catchError } from "../../middlewares/errorHandling.middleware";
import { NotAllowedError } from "../../errors/notAllowedError";
import { SuccessResponse } from "../../types/response";
import { findUserById } from "../../services/entities/user.service";


/**
 * Enables Two-Factor Authentication (2FA) for the user after verifying the provided TOTP (Time-based One-Time Password).
 *
 * @param {Request} req - Express request object containing the logged user's ID and TOTP in the request body.
 * @param {Response} res - Express response object to send a success message if 2FA is enabled.
 * @param {Function} next - Middleware function to handle errors.
 * @returns {Promise<void>} - Sends a success message if TOTP is valid, otherwise throws an error if user not found or TOTP is invalid.
 */
export const enable2faHandler: RequestHandler<
    unknown,
    SuccessResponse
> = catchError(
    async (req, res, next) => {
        // destruct required data
        const { _id } = req.loggedUser
        const { totp } = req.body;

        // check if user exists
        const user = await findUserById(_id, next)


        // verify TOTP
        const verified = authenticator.check(totp, user['2faSecret'] as string)
        if (!verified) return next(new NotAllowedError('Invalid TOTP'))

        // update user 2fa status
        user['2faEnabled'] = true;

        await user.save();

        return res.status(200).json({
            status: true,
            message: 'Two-Factor Authentication enabled successfully',
            data: {},
        });

    }
)