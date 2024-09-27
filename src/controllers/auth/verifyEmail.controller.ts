import { RequestHandler } from "express";
import { catchError } from "../../middlewares/errorHandling.middleware";
import { SuccessResponse } from "../../types/response";
import { Users } from "../../models/user.models";
import { NotFoundError } from "../../errors/notFoundError";
import { hashCode } from "../../utils/crypto";
import { NotAllowedError } from "../../errors/notAllowedError";
import { SystemRoles } from "../../types/roles";
import { generateAccessToken } from "../../utils/token";
import { VerifyReason } from "../../types/verify-reason";

const isExpired = (date: Date) => {
    const currentTime = Date.now();
    const expireTime = date.getTime();
    return currentTime > expireTime;
};

export const verifyEmailHandler: RequestHandler<
    unknown,
    SuccessResponse
> = catchError(
    async (req, res, next) => {
        let { email, code } = req.body;

        const user = await Users.findOne({ email })
        if (!user) return next(new NotFoundError('user not found'));

        if (!user.verificationCode.reason) return next(new NotFoundError('no response to verification code'));
        if (user.verificationCode.code !== hashCode(code)) return next(new NotAllowedError('invalid verification code'));

        if (isExpired(new Date(user.verificationCode.expireAt || 0))) return next(new NotAllowedError('expired verification code'));

        user.verificationCode.expireAt = null;

        let responsedData: any = {};

        if (user.verificationCode?.reason === 'signup') {
            if (user.role === SystemRoles.admin)
                user.role = SystemRoles.student;

            const token = generateAccessToken();
            user.verificationCode.code = null;
            user.verificationCode.expireAt = null;
            user.verificationCode.reason = null;
            user.isVerified = true;
            user.token = token;

            responsedData = {
                token: {
                    access: token,
                },
            };
        } else if (user.verificationCode?.reason === 'update-password') {
            user.verificationCode.code = null;
            user.verificationCode.expireAt = null;
            user.verificationCode.reason = VerifyReason.updatePasswordVerified;

        } else if (user.verificationCode?.reason === VerifyReason.updatePhoneNumber) {
            user.email = user.verificationCode.tempEmail!;
            user.verificationCode.tempEmail = null;
            user.token = null;
            await user.save();
            return res.status(200).json({
                message: 'email updated successfully',
                status: true,
                data: {},
            });
        }
        user.isVerified = true;
        await user.save();
        return res.status(200).json({
            message: 'Verified successfully',
            status: true,
            data: responsedData,
        });

    }
)