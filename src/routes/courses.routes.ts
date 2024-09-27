import { Router } from 'express';

import { isAuthenticated } from '../guards/isAuthenticated.guard';
import { isAuthorized } from '../guards/isAuthorized.guard';
import * as validation from '../validators/course.validator'
import * as controller from '../controllers/courses'
import { SystemRoles } from '../types/roles';
import { uploadDiskStorage } from '../middlewares/multer.middleware';

const router = Router();

/**
 * Defines routes for managing courses.
 */
router.route('/')
    // Handler to create a new course
    .post(
        isAuthenticated,
        isAuthorized(SystemRoles.teacher),
        uploadDiskStorage().single('coverImage'),
        validation.createCourseValidator,
        controller.createCourseHandler
    )
    // Handler to get all courses
    .get(
        controller.getAllCoursesHandler
    )

router.route('/:courseId')
    // Handler to get a course by its ID
    .get(
        controller.getCourseByIdHandler
    )
    // Handler to update a course
    .put(
        isAuthenticated,
        isAuthorized(SystemRoles.teacher),
        uploadDiskStorage().single('coverImage'),
        validation.updateCourseValidator,
        controller.updateCourseHandler
    )
    // Handler to delete a course 
    .post(
        isAuthenticated,
        isAuthorized(SystemRoles.teacher),
        controller.deleteCourseHandler
    )
    // Handler to delete a course 
    .delete(
        isAuthenticated,
        isAuthorized(SystemRoles.teacher),
        controller.confirmDeleteCourseHandler
    )


// handler to get  a course analysis 
router.get('/statistics/:courseId',
    isAuthenticated,
    isAuthorized(SystemRoles.teacher),
    controller.getCourseStatistics

)


export const coursesRoutes = router;

