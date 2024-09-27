import { body, param } from "express-validator"
import { validatorMiddleware } from "../middlewares/validator.middleware"

/*************** Create course validator ***************/
const createCourseValidator = [
    body('title').isString()
        .isLength({
            min: 5,
            max: 100
        })
        .notEmpty()
        .withMessage('Title should be between 5 and 100 characters long'),

    body('description').isString()
        .isLength({
            min: 10,
            max: 1000
        })
        .optional()
        .withMessage('Description should be between 10 and 1000 characters long'),


    body('price').isFloat({ min: 0 })
        .withMessage('Price should be a positive float value'),

    validatorMiddleware

]

/*************** Update course validator ***************/
const updateCourseValidator = [
    param('courseId')
    .isMongoId()
    .withMessage('Invalid course ID format'),


    body('title')
        .isString()
        .isLength({
            min: 5,
            max: 100
        })
        .optional()
        .withMessage('Title should be between 5 and 100 characters long'),


    body('description')
        .isString()
        .isLength({
            min: 10,
            max: 1000
        })
        .optional()
        .withMessage('Description should be between 10 and 1000 characters long'),


    body('price').isFloat({ min: 0 })
        .optional()
        .withMessage('Price should be a positive float value'),

    body('oldPublicId')
        .isString()
        .optional(),

    body().custom((value, { req }) => {
        if (!req.body.title && !req.body.description && !req.body.duration && !req.body.price && !req.body.oldPublicId) {
            throw new Error('At least one of the fields ( title , description , duration , price , oldPublicId ) is required.');
        }
        return true;
    }),

    validatorMiddleware


]   

export {
    createCourseValidator,
    updateCourseValidator
}
