import { RequestHandler } from "express";
import path from "path";
import fs from "fs";

import { catchError } from "../../middlewares/errorHandling.middleware";
import { uploadPDFToCloudinary } from "../../utils/uploadMedia";
import { Certificate } from "../../models/certificate.models";
import { NotFoundError } from "../../errors/notFoundError";
import { SuccessResponse } from "../../types/response";
import { Courses } from "../../models/course.models";
import { createCertificate } from "../../utils/pdf";
import { mailTransporter } from "../../utils/mail";
import { Users } from "../../models/user.models";

/**
 * Handler to generate and send a certificate PDF for a specific user.
 *
 * This handler retrieves the certificate and course information, 
 * validates the instructor's authorization, generates a PDF certificate,
 * uploads it to Cloudinary, and sends the certificate link to the user via email.
 *
 * @param {Request} req - The request object containing the certificate ID in the route parameters.
 * @param {Response} res - The response object used to send the success message.
 * @param {NextFunction} next - The next middleware function to call in case of an error.
 *
 * @returns {Promise<void>} - A promise that resolves to void.
 *
 * @throws {NotFoundError} - Throws an error if the certificate, course, or user is not found.
 */
export const generateCertificatePDFHandler: RequestHandler<unknown, SuccessResponse> = catchError(
    async (req, res, next) => {
        const { certificateId } = req.params;
        const { _id } = req.loggedUser;

        const certificate = await Certificate.findById(certificateId);
        if (!certificate) return next(new NotFoundError('Certificate not found'));

        const course = await Courses.findById(certificate.courseId);
        if (!course) return next(new NotFoundError('Course not found'));

        // Validate instructor authorization
        const instructor = await Users.findById(_id);
        if (!instructor) return next(new NotFoundError('Unauthorized instructor'));
        if (instructor._id.toString() !== _id.toString()) {
            return next(new NotFoundError('Unauthorized instructor'));
        }

        // Retrieve the user for whom the certificate is generated
        const user = await Users.findById(certificate.userId);
        if (!user) return next(new NotFoundError('User not found'));

        // Create a temporary PDF file path
        const dirPath = path.resolve(__dirname, 'PDFs');
        const filePath = path.resolve(dirPath, `${user._id}.pdf`);

        // Generate the certificate PDF
        await createCertificate(user.name, course.title, instructor.name, filePath);

        // Upload the PDF to Cloudinary
        const { secure_url, public_id } = await uploadPDFToCloudinary(filePath);

        certificate.pdfUrl = {
            secure_url,
            public_id
        }

        await certificate.save();

        // Send the verification code via email
        await mailTransporter.sendMail({
            to: user.email,
            subject: 'Your Certificate',
            html: `
                <h1>Congratulations ${user.name}!</h1>
                <p>Your certificate for ${course.title} has been generated successfully.</p>
                <p>You can download it <a href="${secure_url}">here</a>.</p>
            `,
        })

        // delete old pdf file
        fs.unlinkSync(filePath);

        res.status(200).json({
            status: true,
            message: 'Certificate PDF generated successfully',
            data: null
        });

    }
);
