import { RequestHandler } from "express";

import { checkEnrolledCourse } from "../enrolledCourse/checkEnrolledCourse.controller";
import { catchError } from "../../middlewares/errorHandling.middleware";
import { findUserById } from "../../services/entities/user.service";
import { Certificate } from "../../models/certificate.models";
import { NotFoundError } from "../../errors/notFoundError";
import { ConflictError } from "../../errors/conflictError";
import { SuccessResponse } from "../../types/response";
import { SystemRoles } from "../../types/roles";

/**
 * Handler to create a new certificate for a user.
 *
 * This handler checks if a certificate already exists for the given course and user. 
 * If it does not exist, it verifies the user's enrollment in the course and creates 
 * a new certificate.
 *
 * @param {Request} req - The request object containing the certificate data in the body.
 * @param {Response} res - The response object used to send the created certificate.
 * @param {NextFunction} next - The next middleware function to call in case of an error.
 *
 * @returns {Promise<void>} - A promise that resolves to void.
 *
 * @throws {ConflictError} - Throws an error if the certificate already exists.
 * @throws {NotFoundError} - Throws an error if the user or the enrolled course is not found.
 */
export const createCertificateHandler: RequestHandler<
    unknown,
    SuccessResponse
> = catchError(
    async (req, res, next) => {
        const { title, courseId, userId } = req.body;

        // check if certificate is already exists
        const existsCertificate = await Certificate.findOne({ courseId, userId });
        if (existsCertificate) return next(new ConflictError('Conflict Certificate already exists'));

        // Check if the user is not a teacher
        const user = await findUserById(userId, next);
        if (user.role === SystemRoles.teacher) return next(new NotFoundError('Unauthorized user'));

        // Check if the user is enrolled in the course
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

