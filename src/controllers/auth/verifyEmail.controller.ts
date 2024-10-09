import { RequestHandler } from "express";

import { checkVerifyCode, signUpReason } from "../../services/entities/verifyCode.service";
import { catchError } from "../../middlewares/errorHandling.middleware";
import { NotFoundError } from "../../errors/notFoundError";
import { VerifyReason } from "../../types/verify-reason";
import { SuccessResponse } from "../../types/response";
import { Users } from "../../models/user.models";


/**
 * Handles email verification by validating the verification code and processing according to the verification reason.
 *
 * @param {Request} req - Express request object containing the user's email and verification code.
 * @param {Response} res - Express response object to return the response to the client.
 * @param {Function} next - Middleware function to handle any errors.
 * @returns {Promise<void>} - Sends a JSON response with a success message and token if verification is successful.
 */
export const verifyEmailHandler: RequestHandler<
    unknown,
    SuccessResponse
> = catchError(
    async (req, res, next) => {
        // destruct required data from body
        let { email, code } = req.body;

        // check if the user exists
        const user = await Users.findOne({ email })
        if (!user) return next(new NotFoundError('user not found'));

        // check if the verification code is valid
        await checkVerifyCode({ user, code, next });

        user.verificationCode.expireAt = null;

        let responseData: any = {};

        const reason = user.verificationCode?.reason

        // check the reason for the verification code
        if (reason === VerifyReason.signup) {
            const token = await signUpReason(user)
            responseData = token
        } 

        await user.save();

        return res.status(200).json({
            message: 'Verified successfully',
            status: true,
            data: responseData,
        });

    }
)

