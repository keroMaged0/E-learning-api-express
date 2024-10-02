import { body } from "express-validator"

import { validatorMiddleware } from "../middlewares/validator.middleware"

/*************** Sign up Validator ***************/
const createRoomMessageValidator = [
    body('courseId')
        .isString()
        .withMessage('course id must be string')
        .notEmpty()
        .withMessage('course id is required'),

    validatorMiddleware
]

/*************** Sign in Validator ***************/
const updateRoomMessageValidator = [

    validatorMiddleware
]



export {
    createRoomMessageValidator,
    updateRoomMessageValidator,

}