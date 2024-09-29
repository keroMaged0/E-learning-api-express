import { Router } from "express"

import { isAuthenticated } from "../guards/isAuthenticated.guard"
import { isAuthorized } from "../guards/isAuthorized.guard"
import * as validator from '../validators/review.validation'
import * as controller from '../controllers/review/index'
import { SystemRoles } from "../types/roles"

const router = Router()

/**
 * Define routes for managing reviews
 */

router.route('/courses/:courseId')
    // Handler to create a new review for a course
    .post(
        isAuthenticated,
        isAuthorized(SystemRoles.student),
        validator.createReviewSpecificCourseValidator,
        controller.createReviewSpecificCourseHandler
    )
    // Handler to get all reviews for a course by its ID
    .get(
        isAuthenticated,
        isAuthorized(SystemRoles.teacher, SystemRoles.student, SystemRoles.admin),
        controller.getAllReviewsSpecificCourseHandler
    )

router.route('/video/:videoId')
    // Handler to create a new review for a video
    .post(
        isAuthenticated,
        isAuthorized(SystemRoles.student),
        validator.createReviewSpecificVideoValidator,
        controller.createCommentSpecificVideoHandler
    )
    // Handler to get all comment specific to a video
    .get(
        isAuthenticated,
        isAuthorized(SystemRoles.teacher, SystemRoles.student, SystemRoles.admin),
        controller.getAllCommentsSpecificVideoHandler
    )

// Handler to get all reviews specific to a user
router.get('/user',
    isAuthenticated,
    isAuthorized(SystemRoles.student),
    controller.getAllReviewsSpecificUserHandler
)

router.route('/:reviewId')
    // Handler to get a review by its ID
    .get(
        isAuthenticated,
        isAuthorized(SystemRoles.teacher, SystemRoles.student, SystemRoles.admin),
        controller.getReviewByIdHandler
    )
    // Handler to update a review
    .put(
        isAuthenticated,
        isAuthorized(SystemRoles.student),
        validator.updateReviewValidator,
        controller.updateReviewHandler
    )
    // Handler to delete a review 
    .post(
        isAuthenticated,
        isAuthorized(SystemRoles.student),
        controller.deleteReviewHandler
    )
    // Handler to delete a review 
    .delete(
        isAuthenticated,
        isAuthorized(SystemRoles.student),
        controller.confirmDeleteReviewHandler
    )

export const reviewRoutes = router