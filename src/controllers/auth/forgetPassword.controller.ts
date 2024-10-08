import { RequestHandler } from "express";

import { generateAccessToken, generateRefreshToken } from "../../utils/token";
import { catchError } from "../../middlewares/errorHandling.middleware";
import { NotAllowedError } from "../../errors/notAllowedError";
import { NotFoundError } from "../../errors/notFoundError";
import { VerifyReason } from "../../types/verify-reason";
import { SuccessResponse } from "../../types/response";
import { mailTransporter } from "../../utils/mail";
import { hashPassword } from "../../utils/bcrypt";
import { generateCode } from "../../utils/random";
import { Users } from "../../models/user.models";
import { hashCode } from "../../utils/crypto";
import { sendVerifyCode } from "./utils/verifyCode.utils";


/*************** Forget Password handlers ***************/
export const forgetPasswordHandler: RequestHandler<
    unknown,
    SuccessResponse,
    { email: string }
> = catchError(
    async (req, res, next) => {
        // destruct required data
        const { email } = req.body;

        // check if user exist
        const user = await Users.findOne({ email });
        if (!user) return next(new NotFoundError('user not found'));

        if (!user.isVerified) return next(new NotAllowedError('user not verified'));

        // generate verification code and send to user email
        const expireAt = await sendVerifyCode({
            user,
            reason: VerifyReason.updatePasswordVerified,
            subject: 'verification code To Reset Password'
        })

        res.status(200).json({
            status: true,
            message: 'Code sent Successfully',
            data: { expireAt },
        });
    }
)

/*************** Update Forget Password handlers ***************/
export const updateForgetPasswordHandler: RequestHandler<
    unknown,
    SuccessResponse,
    { email: string }
> = catchError(
    async (req, res, next) => {
        const { email, password } = req.body;

        const user = await Users.findOne({ email });
        if (!user) return next(new NotFoundError('user not found'));

        if (!user.isVerified) return next(new NotAllowedError('user not verified'));

        if (user.verificationCode?.reason !== VerifyReason.updatePasswordVerified)
            return next(new NotAllowedError('invalid verification code'));

        // create token
        const userAccessToken = await generateAccessToken();
        const userRefreshToken = await generateRefreshToken();

        const hPassword = await hashPassword(password)

        user.verificationCode.code = null;
        user.verificationCode.expireAt = null;
        user.verificationCode.reason = null;
        user.accessToken = userAccessToken;
        user.refreshToken = userRefreshToken;
        user.password = hPassword

        await user.save();

        res.status(200).json({
            message: 'Password updated successfully',
            status: true,
            data: {
                token: {
                    access: userAccessToken,
                    refresh: userRefreshToken,
                },
            },
        });

    }
)