import { body, param } from "express-validator"

import { validatorMiddleware } from "../middlewares/validator.middleware"


/*************** Remove Participant Validator ***************/
const removeParticipantValidator = [
    param('roomId')
        .isMongoId()
        .withMessage('Room id is required'),


    body('userId')
        .isMongoId()
        .withMessage('User id is required')
        .notEmpty()
        .withMessage('User id is required'),

    validatorMiddleware
]




export {
    removeParticipantValidator

}