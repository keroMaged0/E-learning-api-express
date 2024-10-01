import { Router } from "express"

import { isAuthenticated } from "../guards/isAuthenticated.guard"
import * as validation from '../validators/certificate.validator';
import * as controller from '../controllers/certificate/index';
import { isAuthorized } from "../guards/isAuthorized.guard"
import { SystemRoles } from "../types/roles"


const router = Router()

/**
 * Defines routes for managing certificate.
 */

// Handler to create a new certificate
router.post('/',
    isAuthenticated,
    isAuthorized(SystemRoles.teacher),
    validation.createCertificateValidator,
    controller.createCertificateHandler
)

// Handler to get all Certificate Specific to a course
router.get('/course/:courseId',
    isAuthenticated,
    isAuthorized(SystemRoles.teacher, SystemRoles.student, SystemRoles.admin),
    controller.getAllCertificateSpecificCourseHandler
);

// Handler to create certificate PDF 
router.post('/:certificateId/pdf',
    isAuthenticated,
    isAuthorized(SystemRoles.teacher),
    controller.generateCertificatePDFHandler
);

router.route('/:certificateId')
    // Handler to get a Certificate by its ID
    .get(
        isAuthenticated,
        isAuthorized(SystemRoles.teacher, SystemRoles.student, SystemRoles.admin),
        controller.getCertificateByIdHandler
    )
    // Handler to update a Certificate
    .put(
        isAuthenticated,
        isAuthorized(SystemRoles.teacher),
        validation.updateCertificateValidator,
        controller.updateCertificateHandler
    )
    // Handler to delete a Certificate
    .post(
        isAuthenticated,
        isAuthorized(SystemRoles.teacher),
        controller.deleteCertificateHandler
    )
    // Handler to confirm delete a Certificate 
    .delete(
        isAuthenticated,
        isAuthorized(SystemRoles.teacher),
        controller.ConfirmDeleteCertificateHandler
    );


export const certificateRoutes = router