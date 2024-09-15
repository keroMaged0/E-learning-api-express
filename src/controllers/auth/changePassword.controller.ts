import { RequestHandler } from "express";
import { catchError } from "../../middlewares/errorHandling.middleware";
import { SuccessResponse } from "../../types/response";
import { Users } from "../../models/user.models";
import { NotFoundError } from "../../errors/notFoundError";
import { comparePassword, hashPassword } from "../../utils/bcrypt";
import { NotAllowedError } from "../../errors/notAllowedError";

export const updatePasswordHandler: RequestHandler<
    unknown,
    SuccessResponse,
    { password: string, newPassword: string }
> = catchError(
    async (req, res, next) => {
        const { _id } = req.loggedUser
        const { password, newPassword } = req.body;

        const user = await Users.findById(_id)
        if (!user) return next(new NotFoundError('User not found'))

        const isMatch = await comparePassword(password, user.password)
        if (!isMatch) return next(new NotAllowedError('Incorrect password'))

        const passwordHash = await hashPassword(newPassword)

        user.password = passwordHash

        await user.save();

        res.status(200).json({
            status: true,
            message: 'Password updated successfully',
            data: {},
        });

    }
)