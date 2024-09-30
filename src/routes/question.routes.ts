import { Router } from 'express';

import { isAuthenticated } from '../guards/isAuthenticated.guard';
import * as validation from '../validators/question.validator';
import { isAuthorized } from '../guards/isAuthorized.guard';
import * as controller from '../controllers/question/index';
import { SystemRoles } from '../types/roles';

const router = Router();

/**
 * Defines routes for managing Questions.
 */

// Handler to create a new Question
router.post('/',
    isAuthenticated,
    isAuthorized(SystemRoles.teacher),
    validation.createQuestionValidator,
    controller.createQuestionHandler
)

// Handler to get all Questions of a specific Quiz
router.get('/quiz/:quizId',
    isAuthenticated,
    isAuthorized(SystemRoles.teacher, SystemRoles.student, SystemRoles.admin),
    controller.getAllQuestionsSpecificQuizHandler
);

router.route('/:questionId')
    // Handler to get a Question by its ID
    .get(
        isAuthenticated,
        isAuthorized(SystemRoles.teacher, SystemRoles.student, SystemRoles.admin),
        controller.getQuestionByIdHandler
    )
    // Handler to update a Question
    .put(
        isAuthenticated,
        isAuthorized(SystemRoles.teacher),
        validation.updateQuestionValidator,
        controller.updateQuestionHandler
    )
    // Handler to delete a Question
    .post(
        isAuthenticated,
        isAuthorized(SystemRoles.teacher),
        controller.deleteQuestionHandler
    )
    // Handler to confirm delete a Question 
    .delete(
        isAuthenticated,
        isAuthorized(SystemRoles.teacher),
        controller.ConfirmDeleteQuestionHandler
    );


export const questionRoutes = router

