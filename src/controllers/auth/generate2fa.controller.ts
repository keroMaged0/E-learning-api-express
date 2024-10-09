import { RequestHandler } from "express";
import { authenticator } from "otplib";
import qrcode from "qrcode";

import { catchError } from "../../middlewares/errorHandling.middleware";
import { findUserById } from "../../services/entities/user.service";

/**
 * Generates a two-factor authentication (2FA) secret for the user and sends a QR code image for setup.
 *
 * @param {Request} req - Express request object containing the logged user's ID in the headers.
 * @param {Response} res - Express response object to return the QR code as an image.
 * @param {Function} next - Middleware function to handle any errors.
 * @returns {Promise<void>} - Sends a PNG image of the QR code for 2FA setup or an error if user is not found.
 */
export const generate2faHandler: RequestHandler = catchError(
    async (req, res, next) => {
        // get user id from headers
        const { _id } = req.loggedUser

        // check if user exists
        const user = await findUserById(_id, next)

        // generate secret key
        const secret = authenticator.generateSecret();
        const url = authenticator.keyuri(user.email, 'E-learning', secret)

        user['2faSecret'] = secret;

        await user.save()

        const qrCode = await qrcode.toBuffer(url, {
            type: 'image/png',
            margin: 1
        })

        res.setHeader('Content-Disposition', 'attachment; filename="qrcode.png"')

        return res.status(200).type('image/png').send(qrCode);

    }
)