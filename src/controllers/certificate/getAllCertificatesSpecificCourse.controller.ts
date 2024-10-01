import { RequestHandler } from "express";

import { checkEnrolledCourse } from "../enrolledCourse/checkEnrolledCourse.controller";
import { catchError } from "../../middlewares/errorHandling.middleware";
import { Certificate } from "../../models/certificate.models";
import { NotFoundError } from "../../errors/notFoundError";
import { SuccessResponse } from "../../types/response";


export const getAllCertificateSpecificCourseHandler: RequestHandler<
    unknown,
    SuccessResponse
> = catchError(
    async (req, res, next) => {
        const { courseId } = req.params;
        const { _id } = req.loggedUser;

        await checkEnrolledCourse({ courseId, userId: _id, next });

        const certificates = await Certificate.find({ courseId });
        if (!certificates || certificates.length === 0) return next(new NotFoundError('No certificates found'));

        res.status(200).json({
            status: true,
            message: 'data retrieved successfully',
            data: certificates,
        });

    }
)

