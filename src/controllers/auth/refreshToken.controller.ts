import { RequestHandler } from "express";

import { generateAccessToken, generateRefreshToken, isValidRefreshToken } from "../../utils/token";
import { catchError } from "../../middlewares/errorHandling.middleware";
import { NotFoundError } from "../../errors/notFoundError";
import { SuccessResponse } from "../../types/response";
import { Users } from "../../models/user.models";

export const refreshTokenHandler: RequestHandler<
    unknown,
    SuccessResponse,
    { refreshToken: string }
> = catchError(
    async (req, res, next) => {
        const { refreshToken } = req.body;

        // check if token is valid
        if (!isValidRefreshToken) return res.status(423).json({ message: 'token expired' });
        isValidRefreshToken(refreshToken);

        const user = await Users.findOne({ refreshToken })
        if (!user) return next(new NotFoundError('user not found'));

        // create token
        const userAccessToken = await generateAccessToken();
        const userRefreshToken = await generateRefreshToken();

        user.accessToken = userAccessToken;
        user.refreshToken = userRefreshToken;

        await user.save();

        res.status(200).json({
            message: 'token refreshed successfully',
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