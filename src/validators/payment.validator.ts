import { body, param } from "express-validator"
import { validatorMiddleware } from "../middlewares/validator.middleware"

/*************** Create Payment validator ***************/
const createPaymentValidator = [
   
    validatorMiddleware

]

/*************** Update Payment validator ***************/
const updatePaymentValidator = [
   

    validatorMiddleware


]   

export {
    createPaymentValidator,
    updatePaymentValidator
}
