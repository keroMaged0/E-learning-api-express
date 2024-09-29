import { body, param } from "express-validator"
import { validatorMiddleware } from "../middlewares/validator.middleware"

/*************** Create video validator ***************/
const createVideosValidator = [

    body('title')
        .isString()
        .withMessage('Title must be a string')
        .notEmpty()
        .withMessage('Title is required')
    ,

    body('lessonId')
        .isMongoId()
        .withMessage('Invalid lesson ID format'),
    // .isEmpty().
    // withMessage('Lesson ID is required'),

    validatorMiddleware
]

/*************** Update video validator ***************/
const updateVideosValidator = [
    param('videoId')
        .isMongoId()
        .withMessage('Invalid video ID format'),

    body('title')
        .isString()
        .withMessage('Title must be a string')
        .optional(),

    body('lessonId')
        .isMongoId()
        .withMessage('Invalid lesson ID format')
        .optional(),

    body('oldPublicId')
        .isString()
        .withMessage('Old public ID must be a string')
        .optional(),

    body().custom((value, { req }) => {
        if (!req.body.title && !req.body.lessonId && !req.body.oldPublicId) {
            throw new Error('At least one of the fields ( title , lessonId , oldPublicId ) is required.');
        }
        return true;
    }),


    validatorMiddleware
]


export {
    createVideosValidator,
    updateVideosValidator
}