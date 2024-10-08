import { RequestHandler } from "express";

import { catchError } from "../../middlewares/errorHandling.middleware";
import { comparePassword, hashPassword } from "../../utils/bcrypt";
import { NotAllowedError } from "../../errors/notAllowedError";
import { NotFoundError } from "../../errors/notFoundError";
import { SuccessResponse } from "../../types/response";
import { Users } from "../../models/user.models";

/**
 * Handles updating a user's password.
 * Validates the current password, hashes the new password, and updates the user record with the new password.
 *
 * @param {Request} req - Express request object containing the current and new password in the request body.
 * @param {Response} res - Express response object to confirm password update.
 * @param {Function} next - Middleware function to handle errors.
 * @returns {Promise<void>} - Sends a success response if the password is updated, or throws an error if validation fails.
 */
export const updatePasswordHandler: RequestHandler<
    unknown,
    SuccessResponse,
    { password: string, newPassword: string }
> = catchError(
    async (req, res, next) => {
        // destruct required data 
        const { _id } = req.loggedUser
        const { password, newPassword } = req.body;

        // check if user exist
        const user = await Users.findById(_id)
        if (!user) return next(new NotFoundError('User not found'))

        // check if password is correct
        const isMatch = await comparePassword(password, user.password)
        if (!isMatch) return next(new NotAllowedError('Incorrect password'))

        // hash new password
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