import { Router } from 'express';

import { isAuthenticated } from '../guards/isAuthenticated.guard';
import { isAuthorized } from '../guards/isAuthorized.guard';
import * as validation from '../validators/quiz.validator';
import * as controller from '../controllers/quiz/index';
import { SystemRoles } from '../types/roles';

const router = Router();

/**
 * Defines routes for managing quizzes.
 */

// Handler to create a new quiz
router.post('/',
    isAuthenticated,
    isAuthorized(SystemRoles.teacher),
    validation.createQuizValidator,
    controller.createQuizHandler
)

// Handler to get all quizzes Specific to a course
router.get('/course/:courseId',
    isAuthenticated,
    isAuthorized(SystemRoles.teacher, SystemRoles.student, SystemRoles.admin),
    controller.getAllQuizzesSpecificCourseHandler
);


router.route('/:quizId')
    // Handler to get a quiz by its ID
    .get(
        isAuthenticated,
        isAuthorized(SystemRoles.teacher, SystemRoles.student, SystemRoles.admin),
        controller.getQuizByIdHandler
    )
    // Handler to update a quiz
    .put(
        isAuthenticated,
        isAuthorized(SystemRoles.teacher),
        validation.updateQuizValidator,
        controller.updateQuizHandler
    )
    // Handler to delete a quiz
    .post(
        isAuthenticated,
        isAuthorized(SystemRoles.teacher),
        controller.deleteQuizHandler
    )
    // Handler to confirm delete a quiz 
    .delete(
        isAuthenticated,
        isAuthorized(SystemRoles.teacher),
        controller.ConfirmDeleteQuizHandler
    );



export const quizRoutes = router;

