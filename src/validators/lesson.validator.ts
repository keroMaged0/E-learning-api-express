import { body, param } from "express-validator"
import { validatorMiddleware } from "../middlewares/validator.middleware";

const createLessonsValidator = [
    body('title')
        .isString()
        .notEmpty()
        .withMessage('Title is required')
        .isLength({ min: 5, max: 100 })
        .withMessage('Title should be between 5 and 100 characters long'),


    body('content')
        .isString()
        .isLength({ min: 5 })
        .withMessage('Content should be at least 5 characters long')
        .optional(),

    body('courseId')
        .notEmpty()
        .withMessage('Course ID is required'),

    body('resources')
        .isArray()
        .withMessage('Resources should be an array')
        .custom((arr) => arr.every(item => typeof item === 'string'))
        .withMessage('Each resource should be a string')
        .optional(),
    validatorMiddleware
]

const updateLessonsValidator = [
    param('lessonId')
        .isMongoId()
        .withMessage('Invalid lessonId ID format'),

    body('title')
        .isString()
        .isLength({ min: 5, max: 100 })
        .withMessage('Title should be between 5 and 100 characters long')
        .optional(),

    body('courseId')
        .isMongoId()
        .withMessage('Invalid course ID format')
        .optional(),

    body('oldPublicId')
        .isString()
        .optional(),

    body().custom((value, { req }) => {
        if (!req.body.title && !req.body.courseId && !req.body.oldPublicId) {
            throw new Error('At least one of the fields ( title , courseId , oldPublicId ) is required.');
        }
        return true;
    }),
    validatorMiddleware,
]

export {
    createLessonsValidator,
    updateLessonsValidator
}