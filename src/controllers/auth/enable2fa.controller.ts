import { authenticator } from "otplib";
import { NotFoundError } from "../../errors/notFoundError";
import { catchError } from "../../middlewares/errorHandling.middleware";
import { Users } from "../../models/user.models";
import { NotAllowedError } from "../../errors/notAllowedError";
import { RequestHandler } from "express";
import { SuccessResponse } from "../../types/response";

export const enable2faHandler: RequestHandler<
    unknown,
    SuccessResponse
> = catchError(
    async (req, res, next) => {
        const { _id } = req.loggedUser
        const { totp } = req.body;

        if (!totp) return next(new NotFoundError('totp is required'))

        const user = await Users.findById(_id)
        if (!user) return next(new NotFoundError('User not found'))

        // verify TOTP
        const verified = authenticator.check(totp, user['2faSecret'] as string)
        if (!verified) return next(new NotAllowedError('Invalid TOTP'))

        user['2faEnabled'] = true;

        await user.save();

        return res.status(200).json({
            status: true,
            message: 'Two-Factor Authentication enabled successfully',
            data: {},
        });

    }
)