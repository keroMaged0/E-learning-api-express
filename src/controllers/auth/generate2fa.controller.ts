import { authenticator } from "otplib";
import qrcode from "qrcode";

import { catchError } from "../../middlewares/errorHandling.middleware";
import { NotFoundError } from "../../errors/notFoundError";
import { Users } from "../../models/user.models";
import { RequestHandler } from "express";


export const generate2faHandler: RequestHandler = catchError(
    async (req, res, next) => {

        const { _id } = req.loggedUser

        const user = await Users.findById(_id)
        if (!user) return next(new NotFoundError('User not found'))

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