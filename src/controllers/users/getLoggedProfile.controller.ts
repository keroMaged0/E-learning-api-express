import { RequestHandler } from "express";
import { SuccessResponse } from "../../types/response";
import { catchError } from "../../middlewares/errorHandling.middleware";
import { Users } from "../../models/user.models";
import { env } from "../../config/env";
import { NotFoundError } from "../../errors/notFoundError";

export const getLoggedProfileHandler: RequestHandler<
    unknown,
    SuccessResponse
> = catchError(
    async (req, res, next) => {
        const { _id } = req.loggedUser;

        const user = await Users.aggregate([
            {
                $match: { _id },

            },
            {
                $project: {
                    name: 1,
                    email: 1,
                    phoneNumber: 1,
                    gender: 1,
                    profileImage: { $concat: [env.apiUrl + '/api/v1/attachments?filePath=', '$profileImage'] },
                    isVerified: 1,
                    bornAt: {
                        $dateToString: {
                            format: '%Y-%m-%d',
                            date: '$bornAt',
                        },
                    },
                }
            }

        ])
        if (!user) return next(new NotFoundError('user not found'));

        res.status(200).json({
            status: true,
            message: 'success',
            data: user[0],
        });
    }
)