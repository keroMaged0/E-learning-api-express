import { RequestHandler } from "express";
import { catchError } from "../../middlewares/errorHandling.middleware";
import { SuccessResponse } from "../../types/response";
import { Certificate } from "../../models/certificate.models";
import { NotFoundError } from "../../errors/notFoundError";
import { checkEnrolledCourse } from "../enrolledCourse/checkEnrolledCourse.controller";
import { Users } from "../../models/user.models";
import { SystemRoles } from "../../types/roles";


export const getCertificateByIdHandler: RequestHandler<
    unknown,
    SuccessResponse
> = catchError(
    async (req, res, next) => {
        const { certificateId } = req.params;
        const { _id } = req.loggedUser;

        const certificate = await Certificate.findById(certificateId);
        if (!certificate) return next(new NotFoundError('Certificate not found'));

        const user = await Users.findById(_id);
        if (!user) return next(new NotFoundError('User not found'));

        if (user.role === SystemRoles.teacher) {
            await checkEnrolledCourse({ courseId: certificate.courseId, userId: _id, next });
        }

        if (user.role === SystemRoles.student) {
            await checkEnrolledCourse({ courseId: certificate.courseId, userId: user._id, next });
        }

        res.status(200).json({
            status: true,
            message: 'data retrieved successfully',
            data: certificate,
        });

    }
)

