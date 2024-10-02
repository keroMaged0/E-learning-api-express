import { body } from "express-validator"

import { validatorMiddleware } from "../middlewares/validator.middleware"
import { SystemRoles } from "../types/roles"

/*************** Sign up Validator ***************/
const createChatMessageValidator = [

    validatorMiddleware
]

/*************** Sign in Validator ***************/
const updateChatMessageValidator = [

    validatorMiddleware
]



export {
    createChatMessageValidator,
    updateChatMessageValidator,

}