import { Router } from 'express';

import { uploadDiskStorage } from '../middlewares/multer.middleware';
import { isAuthenticated } from '../guards/isAuthenticated.guard';
import { isAuthorized } from '../guards/isAuthorized.guard';
import * as validation from '../validators/lesson.validator'
import * as controller from '../controllers/lessons'
import { SystemRoles } from '../types/roles';

const router = Router();

/**
 * Defines routes for managing Lessons.
 */
router.route('/')
    // Handler to create a new lesson
    .post(
        isAuthenticated,
        isAuthorized(SystemRoles.teacher),
        uploadDiskStorage().single('coverImage'),
        validation.createLessonsValidator,
        controller.createLessonsHandler
    )

// Handler to get all Lessons related to a course
router.get('/allLessons/:courseId',
    controller.getAllLessonsHandler
)

router.route('/:lessonId')
    // Handler to get a lesson by its ID
    .get(
        controller.getLessonsByIdHandler
    )
    // Handler to update a lesson
    .put(
        isAuthenticated,
        isAuthorized(SystemRoles.teacher),
        uploadDiskStorage().single('coverImage'),
        validation.updateLessonsValidator,
        controller.updateLessonsHandler
    )
    // Handler to delete a lesson 
    .post(
        isAuthenticated,
        isAuthorized(SystemRoles.teacher),
        controller.deleteLessonsHandler
    )
    // Handler to delete a lesson 
    .delete(
        isAuthenticated,
        isAuthorized(SystemRoles.teacher),
        controller.confirmDeleteLessonsHandler
    )


export const lessonsRoutes = router;

