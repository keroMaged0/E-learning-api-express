import { body } from "express-validator"

import { validatorMiddleware } from "../middlewares/validator.middleware"
import { SystemRoles } from "../types/roles"

/*************** Sign up Validator ***************/
const signupValidator = [
    body('name')
        .isString().
        bail().
        trim(),

    body('email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format'),

    body('password')
        .isString().
        bail()
        .isStrongPassword({
            minLength: 8,
            minLowercase: 0,
            minSymbols: 0,
            minUppercase: 0,
            minNumbers: 0,
        }).withMessage('Weak password'),

    body('phoneNumber')
        .isString()
        .isMobilePhone('ar-EG')
        .withMessage('must be a valid number'),

    body('gender')
        .optional()
        .isIn(['male', 'female']),

    body('bornAt')
        .isDate({
            strictMode: true,
            format: 'YYYY-MM-DD'
        }).bail()
        .customSanitizer(
            (el) =>
                new Date(el)
        ),

    body('role')
        .optional()
        .isIn(Object.values(SystemRoles))
        .withMessage('Role must be one of the predefined roles (admin, student, teacher).'),
    

    validatorMiddleware
]

/*************** Sign in Validator ***************/
const signinValidator = [
    body('email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format'),
    body('password').isString().bail().isStrongPassword({
        minLength: 8,
        minLowercase: 0,
        minSymbols: 0,
        minUppercase: 0,
        minNumbers: 0,
    }).withMessage('Weak password'),
    validatorMiddleware
]

/*************** Verify Email Validator ***************/
const verifyValidator = [
    body('email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format'),
    body('code')
        .notEmpty().withMessage('Verification code is required')
        .isString().withMessage('Verification code must be a string'),
    validatorMiddleware
]

/*************** Resend Verification Code Validator ***************/
const resendVerificationCodeValidator = [
    body('email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format'),
    validatorMiddleware
]

/*************** Enable 2FA Validator ***************/
const enable2faValidator = [
    body('totp')
        .exists({ checkFalsy: true }) // Ensure that 'totp' exists and is not falsy (null, undefined, empty string)
        .withMessage('TOTP is required') // Custom error message if the field is missing
        .isLength({ min: 6, max: 6 }) // Assuming TOTP is always 6 digits
        .isNumeric()
        .withMessage('TOTP must be a 6-digit numeric value'),

    validatorMiddleware
]

/*************** Login 2FA Validator ***************/
const login2faValidator = [
    body('totp')
        .exists({ checkFalsy: true }) // Ensure that 'totp' exists and is not falsy (null, undefined, empty string)
        .withMessage('TOTP is required') // Custom error message if the field is missing
        .isLength({ min: 6, max: 6 }) // Assuming TOTP is always 6 digits
        .isNumeric()
        .withMessage('TOTP must be a 6-digit numeric value'),

    body('tempToken')
        .exists({ checkFalsy: true }) // Ensure that 'tempToken' exists and is not falsy
        .withMessage('Temporary Token is required') // Custom error message if the field is missing
        .isUUID()
        .withMessage('Temporary Token must be a valid UUID'),

    validatorMiddleware
];

/*************** Refresh Token Validator ***************/
const refreshTokenValidator = [
    body('refreshToken')
        .exists({ checkFalsy: true }) // Ensure that'refreshToken' exists and is not falsy
        .withMessage('Refresh Token is required'),// Custom error message if the field is missing
    validatorMiddleware
]


/*************** Update Password Validator ***************/
const updatePasswordValidator = [

    body('password')
        .notEmpty().withMessage('Current password is required')
        .isStrongPassword({
            minLength: 8,
            minLowercase: 0,
            minSymbols: 0,
            minUppercase: 0,
            minNumbers: 0,
        }).withMessage('Weak current password'),


    body('newPassword')
        .notEmpty().withMessage('New password is required')
        .isStrongPassword({
            minLength: 8,
            minLowercase: 0,
            minSymbols: 0,
            minUppercase: 0,
            minNumbers: 0,
        }).withMessage('Weak new password'),

    validatorMiddleware

]

/*************** Ask Forget Password Validator ***************/
const forgetPasswordValidator = [
    body('email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format'),
    validatorMiddleware
]


/*************** Update Forget Password Validator ***************/
const updateForgetPasswordValidator = [
    body('password')
        .notEmpty().withMessage(' password is required')
        .isStrongPassword({
            minLength: 8,
            minLowercase: 0,
            minSymbols: 0,
            minUppercase: 0,
            minNumbers: 0,
        }).withMessage('Weak current password'),

    body('email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format'),
    validatorMiddleware
]







export {
    signupValidator,
    signinValidator,
    verifyValidator,
    resendVerificationCodeValidator,
    enable2faValidator,
    login2faValidator,
    refreshTokenValidator,
    updatePasswordValidator,
    forgetPasswordValidator,
    updateForgetPasswordValidator
}