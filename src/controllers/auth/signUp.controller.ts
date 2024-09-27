import { RequestHandler } from "express";
import mongoose from "mongoose";

import { VerifyReason } from "../../types/verify-reason";
import { SuccessResponse } from "../../types/response";
import { mailTransporter } from "../../utils/mail";
import { hashPassword } from "../../utils/bcrypt";
import { generateCode } from "../../utils/random";
import { Users } from "../../models/user.models";
import { hashCode } from "../../utils/crypto";
import { catchError } from "../../middlewares/errorHandling.middleware";

/**
 * Handles user sign-up by creating a new user, sending a verification email, and returning verification details.
 *
 * @param {Request} req - Express request object containing user details (email, password, etc.).
 * @param {Response} res - Express response object for sending the response to the client.
 * @returns {Promise<void>} - Sends a JSON response with the verification code details.
 */
export const signUpHandler: RequestHandler<
    unknown,
    SuccessResponse<{ verificationCode: any }>
> = catchError(
    async (req, res, next) => {        

        const code = generateCode();  // Generate verification code

        const userId = new mongoose.Types.ObjectId().toHexString();  // Generate user ID

        const hashedPassword = await hashPassword(req.body.password);  // Hash the password

        const user = await Users.create({
            _id: userId,
            ...req.body,
            password: hashedPassword,
            verificationCode: {
                code: hashCode(code),
                expireAt: new Date(Date.now() + 60 * 60 * 1000),  // Expires in 1 hour
                reason: VerifyReason.signup,
            }
        });

        await mailTransporter.sendMail({
            to: user.email,
            subject: 'Verify your account to login',
            html: `Verification code: <strong>${code}</strong>`,  // Send verification email
        });

        res.status(201).json({
            status: true,
            message: 'Verification code sent successfully',
            data: {
                verificationCode: {
                    expireAt: user.verificationCode.expireAt,
                    reason: user.verificationCode.reason,
                },
            },
        });
    }
)    