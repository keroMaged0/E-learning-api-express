import { RequestHandler } from "express";

import { checkEnrolledCourse } from "../enrolledCourse/checkEnrolledCourse.controller";
import { catchError } from "../../middlewares/errorHandling.middleware";
import { Certificate } from "../../models/certificate.models";
import { SuccessResponse } from "../../types/response";
import { Users } from "../../models/user.models";
import { NotFoundError } from "../../errors/notFoundError";
import { SystemRoles } from "../../types/roles";
import { ConflictError } from "../../errors/conflictError";


export const createCertificateHandler: RequestHandler<
    unknown,
    SuccessResponse
> = catchError(
    async (req, res, next) => {
        const { title, courseId, userId } = req.body;
        const { _id } = req.loggedUser;

        // check if certificate is already exists
        const existsCertificate = await Certificate.findOne({ courseId, userId });
        if (existsCertificate) return next(new ConflictError('Conflict Certificate already exists'));

        const user = await Users.findById(userId);
        if (!user) return next(new NotFoundError('User not found'));
        if (user.role === SystemRoles.teacher) return next(new NotFoundError('Unauthorized user'));

        await checkEnrolledCourse({ courseId, userId, next })

        // Create and save the certificate
        const certificate = new Certificate({ title, courseId, userId: user._id });
        await certificate.save();

        res.status(201).json({
            status: true,
            message: 'Certificate created successfully',
            data: {
                certificate
            },
        });
    }
)

