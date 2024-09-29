import { body, param } from "express-validator"
import { validatorMiddleware } from "../middlewares/validator.middleware"

/*************** Create review specific course validator ***************/
const createReviewSpecificCourseValidator = [
    body('rating')
        .isNumeric()
        .withMessage('Rating must be a number')
        .isInt({ min: 1, max: 5 })
        .withMessage('Rating must be between 1 and 5')
        .notEmpty()
        .withMessage('Rating is required'),

    param('courseId')
        .isMongoId()
        .withMessage('Invalid course ID format')
        .notEmpty()
        .withMessage('Course ID is required'),


    validatorMiddleware
]

/*************** Create review specific video validator ***************/
const createReviewSpecificVideoValidator = [
    body('comment')
    .isLength({ min: 5, max: 500 })
    .withMessage('Comment must be between 5 and 500 characters long')
    .notEmpty()
    .withMessage('Comment is required'),

    param('videoId')
    .isMongoId()
    .withMessage('Invalid video ID format')
    .notEmpty()
    .withMessage('Video ID is required'),

    validatorMiddleware
]

/*************** Update review validator ***************/
const updateReviewValidator = [
    body('rating')
        .isNumeric()
        .withMessage('Rating must be a number')
        .isInt({ min: 1, max: 5 })
        .withMessage('Rating must be between 1 and 5')
        .optional(),


    body('comment')
        .isLength({ min: 5, max: 500 })
        .withMessage('Comment must be between 5 and 500 characters long')
        .optional(),

    param('reviewId')
        .isMongoId()
        .withMessage('Invalid review ID format'),

    body().custom((value, { req }) => {
        if (!req.body.rating && !req.body.comment) {
            throw new Error('At least one of the fields ( rating , comment ) is required.');
        }
        return true;
    }),

    validatorMiddleware
]


export {
    createReviewSpecificCourseValidator,
    createReviewSpecificVideoValidator,
    updateReviewValidator
}