import { RequestHandler } from "express";

import { catchError } from "../../middlewares/errorHandling.middleware";
import { sendVerifyCode } from "../../services/entities/verifyCode.service";
import { findUser } from "../../services/entities/user.service";
import { NotAllowedError } from "../../errors/notAllowedError";
import { SuccessResponse } from "../../types/response";


/**
 * Handles resending the verification code to the user's email if the cooldown period has passed.
 *
 * @param {Request} req - Express request object containing the user's email.
 * @param {Response} res - Express response object to return the response to the client.
 * @param {Function} next - Middleware function to handle any errors.
 * @returns {Promise<void>} - Sends a JSON response with either the remaining cooldown time or success message.
 */
export const resendVerificationCodeHandler: RequestHandler<
    unknown,
    SuccessResponse
> = catchError(
    async (req, res, next) => {
        // destruct email from request body
        const { email } = req.body;

        // check if the user exists
        const user = await findUser(email, next)

        const currentTime = Date.now();
        const expireTime = new Date(user.verificationCode?.expireAt || '0').getTime();
        const remainingTimeToResendInSec = Math.floor((expireTime - currentTime) / 1000);

        // check time to resend code again
        if (currentTime < expireTime)
            return res.status(200).json({
                status: false,
                message: 'You have to wait before sending the code again',
                data: {
                    remainingTime: remainingTimeToResendInSec,
                },
            });
        if (!user.verificationCode?.reason) return next(new NotAllowedError('not found reason to send code'));

        const reason = user.verificationCode?.reason;

        // generate code and send it to the user
        const expireAt = await sendVerifyCode({ user, reason, subject: 'Verify your account' });

        res.status(200).json({
            status: true,
            message: 'Code sent Successfully',
            data: {
                expireAt,
                reason: user.verificationCode.reason,
            },
        });

    }
)