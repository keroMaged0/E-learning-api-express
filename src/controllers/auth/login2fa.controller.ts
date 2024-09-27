import { RequestHandler } from "express";

import { catchError } from "../../middlewares/errorHandling.middleware";
import { SuccessResponse } from "../../types/response";
import { Users } from "../../models/user.models";
import { NotFoundError } from "../../errors/notFoundError";
import { authenticator } from "otplib";
import { NotAllowedError } from "../../errors/notAllowedError";
import { generateAccessToken } from "../../utils/token";
import { getData } from "../../services/redisCache.service";
import { env } from "../../config/env";

export const login2faHandler: RequestHandler<
    unknown,
    SuccessResponse,
    { tempToken: string; totp: string }
> = catchError(
    async (req, res, next) => {
        const { tempToken, totp } = req.body

        const cacheKey = `${env.redis.cacheTempKey}${tempToken}`;

        const userId = await getData(cacheKey)
        if (!userId) return next(new NotFoundError('User not found'));

        const user = await Users.findById({ _id: userId })
        if (!user) return next(new NotFoundError('User not found'))

        const verified = authenticator.check(totp, user['2faSecret'] as string)
        if (!verified) return next(new NotAllowedError('2FA verification failed or not valid totp'))

        const accessToken = await generateAccessToken()
        const refreshToken = await generateAccessToken()

        user.accessToken = accessToken
        user.refreshToken = refreshToken

        await user.save()

        res.status(200).json({
            message: '2FA logged in successfully',
            status: true,
            data: {
                token: {
                    access: accessToken,
                    refresh: refreshToken,
                },
            },
        })


    }
)