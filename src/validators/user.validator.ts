import { body } from "express-validator"
import { validatorMiddleware } from "../middlewares/validator.middleware"

/*************** Update Profile Validator ***************/
const updateProfileValidator = [
    body('name').optional().isString().bail().trim(),
    body('gender').optional().isIn(['male', 'female']),
    body('oldPublicId').optional().isString(),
    // Custom validation to ensure at least one of the fields is present
    body().custom((value, { req }) => {
        if (!req.body.name && !req.body.gender && !req.body.oldPublicId) {
            throw new Error('At least one of the fields (name, gender, oldPublicId) is required.');
        }   
        return true;
    }),
    validatorMiddleware
]



export {
    updateProfileValidator,

}