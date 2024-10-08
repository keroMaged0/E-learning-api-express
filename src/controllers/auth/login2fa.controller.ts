import { RequestHandler } from "express";
import { authenticator } from "otplib";

import { catchError } from "../../middlewares/errorHandling.middleware";
import { NotAllowedError } from "../../errors/notAllowedError";
import { getData } from "../../services/redisCache.service";
import { NotFoundError } from "../../errors/notFoundError";
import { generateAccessToken } from "../../utils/token";
import { SuccessResponse } from "../../types/response";
import { Users } from "../../models/user.models";
import { env } from "../../config/env";


/**
 * Handles login with Two-Factor Authentication (2FA) by verifying the provided TOTP (Time-based One-Time Password) and issuing access and refresh tokens.
 *
 * @param {Request} req - Express request object containing the temporary token and TOTP in the request body.
 * @param {Response} res - Express response object to send the access and refresh tokens upon successful login.
 * @param {Function} next - Middleware function to handle errors.
 * @returns {Promise<void>} - Sends tokens if TOTP is valid, or throws an error if user not found or TOTP is invalid.
 */
export const login2faHandler: RequestHandler<
    unknown,
    SuccessResponse,
    { tempToken: string; totp: string }
> = catchError(
    async (req, res, next) => {
        // destruct required data from body
        const { tempToken, totp } = req.body

        const cacheKey = `${env.redis.cacheTempKey}${tempToken}`;

        // get user id from cache
        const userId = await getData(cacheKey)
        if (!userId) return next(new NotFoundError('User not found'));

        // check if user exists
        const user = await Users.findById({ _id: userId })
        if (!user) return next(new NotFoundError('User not found'))

        // verify TOTP
        const verified = authenticator.check(totp, user['2faSecret'] as string)
        if (!verified) return next(new NotAllowedError('2FA verification failed or not valid totp'))

        // generate new access and refresh tokens
        const accessToken = await generateAccessToken()
        const refreshToken = await generateAccessToken()

        // update user tokens
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