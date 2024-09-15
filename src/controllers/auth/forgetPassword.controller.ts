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


/*************** Forget Password handlers ***************/
export const forgetPasswordHandler: RequestHandler<
    unknown,
    SuccessResponse,
    { email: string }
> = catchError(
    async (req, res, next) => {
        const { email } = req.body;

        const user = await Users.findOne({ email });
        if (!user) return next(new NotFoundError('user not found'));

        if (!user.isVerified) return next(new NotAllowedError('user not verified'));

        const code = generateCode();

        user.verificationCode = {
            code: hashCode(code),
            expireAt: new Date(Date.now() + 10 * 60 * 1000),
            reason: VerifyReason.updatePasswordVerified,
            tempEmail: null,
        };

        await user.save();

        await mailTransporter.sendMail({
            to: user.email,
            subject: 'verification code To Reset Password',
            html: `verification code <bold>${code}</bold>`,
        });

        res.status(200).json({
            status: true,
            message: 'Code sent Successfully',
            data: {},
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