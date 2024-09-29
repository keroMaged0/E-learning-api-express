import { body, param } from "express-validator"
import { validatorMiddleware } from "../middlewares/validator.middleware"

/*************** Create Payment validator ***************/
const initiatePaymentValidator = [
    body('courseId')
        .notEmpty()
        .withMessage('Course ID is required')
        .isMongoId()
        .withMessage('Invalid course ID format'),

    body('paymentMethod')
        .notEmpty()
        .withMessage('Payment method is required')
        .isIn(['stripe', 'paymob'])
        .withMessage('Invalid payment method'),

    validatorMiddleware
]

/*************** Update Payment validator ***************/
const checkPaymentStatusValidator = [
    param('paymentId')
        .notEmpty()
        .withMessage('Payment ID is required')
        .isMongoId()
        .withMessage('Invalid payment ID format'),

    validatorMiddleware
]

/*************** Update Payment validator ***************/
const getUserPaymentsValidator = [
    param('userId')
        .notEmpty()
        .withMessage('User ID is required')
        .isMongoId()
        .withMessage('Invalid user ID format'),

    validatorMiddleware
]

/*************** Update Payment validator ***************/
const cancelPaymentValidator = [
    param('paymentId')
        .notEmpty()
        .withMessage('Payment ID is required')
        .isMongoId()
        .withMessage('Invalid payment ID format'),

    validatorMiddleware
]

export {
    initiatePaymentValidator,
    checkPaymentStatusValidator,
    getUserPaymentsValidator,
    cancelPaymentValidator
}
