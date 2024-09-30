import { body, param } from "express-validator"
import { validatorMiddleware } from "../middlewares/validator.middleware"


/*************** Create quiz validator ***************/
const createQuizValidator = [
    body('title')
        .isString()
        .withMessage('Title must be a string')
        .notEmpty()
        .withMessage('Title is required'),


    body('description')
        .optional()
        .isString()
        .withMessage('Description must be a string'),

    body('courseId')
        .isMongoId()
        .withMessage('Invalid course ID'),

    validatorMiddleware
]
const updateQuizValidator = [
    body('title')
        .optional()
        .isString()
        .withMessage('Title must be a string'),

    body('description')
        .optional()
        .isString()
        .withMessage('Description must be a string'),

    body('courseId')
        .optional()
        .isMongoId()
        .withMessage('Invalid course ID'),

    param('quizId')
        .isMongoId()
        .withMessage('Invalid quiz ID'),

    body().custom((value, { req }) => {
        if (!req.body.title && !req.body.description && !req.body.courseId) {
            throw new Error('At least one field must be provided to update quiz');
        }
        return true;
    }),


    validatorMiddleware

]


export {
    createQuizValidator,
    updateQuizValidator
}