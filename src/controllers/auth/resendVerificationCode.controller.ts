import { RequestHandler } from "express";
import { catchError } from "../../middlewares/errorHandling.middleware";
import { SuccessResponse } from "../../types/response";
import { Users } from "../../models/user.models";
import { NotFoundError } from "../../errors/notFoundError";
import { NotAllowedError } from "../../errors/notAllowedError";
import { generateCode } from "../../utils/random";
import { hashCode } from "../../utils/crypto";
import { mailTransporter } from "../../utils/mail";

export const resendVerificationCodeHandlerL: RequestHandler<
    unknown,
    SuccessResponse
> = catchError(
    async (req, res, next) => {
        const { email } = req.body;

        const user = await Users.findOne({
            email: email,
        });
        if (!user) return next(new NotFoundError('user not found'));

        const currentTime = Date.now();
        const expireTime = new Date(user.verificationCode?.expireAt || '0').getTime();
        const remainingTimeToResendInSec = Math.floor((expireTime - currentTime) / 1000);

        if (currentTime < expireTime)
            return res.status(200).json({
                status: false,
                message: 'You have to wait before sending the code again',
                data: {
                    remainingTime: remainingTimeToResendInSec,
                },
            });
        if (!user.verificationCode?.reason) return next(new NotAllowedError('not found reason to send code'));

        const expireAt = new Date(Date.now() + 10 * 60 * 1000);
        const code = generateCode();

        user.verificationCode = {
            code: hashCode(code),
            expireAt,
            reason: user.verificationCode.reason,
            tempEmail: user.verificationCode.tempEmail,
        };

        await user.save();

        await mailTransporter.sendMail({
            to: user.email,
            subject: 'Verify your 8aya account',
            html: `verification code <bold>${code}</bold>`,
        });

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