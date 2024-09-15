import { RequestHandler } from "express";
import crypto from "crypto";

import { generateAccessToken, generateRefreshToken } from "../../utils/token";
import { catchError } from "../../middlewares/errorHandling.middleware";
import { NotAllowedError } from "../../errors/notAllowedError";
import { NotFoundError } from "../../errors/notFoundError";
import { SuccessResponse } from "../../types/response";
import { comparePassword } from "../../utils/bcrypt";
import { Users } from "../../models/user.models";
import { setCache } from "../../services/redisCache.service";
import { env } from "../../config/env";
import { logger } from "../../config/logger";


export const generateTempToken = async (userId: string): Promise<{ token: string; expiresInSeconds: number }> => {
    const tempToken = crypto.randomUUID();
    const cacheKey = `${env.redis.cacheTempKey}${tempToken}`;
    const expiresInSeconds = env.redis.cacheTempExpire;

    try {
        await setCache(cacheKey, userId, expiresInSeconds);
        return { token: tempToken, expiresInSeconds };
    } catch (error) {
        logger.error('Failed to store temporary token in cache:', error)
        throw new Error('Failed to generate temporary token');
    }

}

export const signInHandler: RequestHandler<
    unknown,
    SuccessResponse,
    { email: string; password: string }
> = catchError(
    async (req, res, next) => {
        const user = await Users.findOne({ email: req.body.email })
        if (!user) return next(new NotFoundError());

        const isMatch = await comparePassword(req.body.password, user?.password || '')
        if (!isMatch) return next(new NotFoundError('password mismatch or not correct email'));

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
        user.isLogin = true;

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