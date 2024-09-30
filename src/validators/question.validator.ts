import { body, param } from "express-validator"
import { validatorMiddleware } from "../middlewares/validator.middleware";

/*************** Create question validator ***************/
const createQuestionValidator = [
    body('quizId')
        .isMongoId()
        .withMessage('Invalid quiz ID')
        .notEmpty()
        .withMessage('Quiz ID is required'),

    body('questionText')
        .isString()
        .withMessage('Question text must be a string')
        .notEmpty()
        .withMessage('Question text is required'),

    body('options')
        .isArray()
        .withMessage('Options must be an array')
        .notEmpty()
        .withMessage('Options are required')
        .custom((value: string[]) => {
            if (value.length < 2) {
                throw new Error('At least two options are required');
            }
            return true;
        })
        .custom((value: string[]) => {
            if (value.length > 6) {
                throw new Error('Maximum of 6 options are allowed');
            }
            return true;
        }),

    body('correctAnswer')
        .isString()
        .withMessage('Correct answer must be a string')
        .notEmpty()
        .withMessage('Correct answer is required')
        .custom((value: string, { req }) => {
            if (!req.body.options.includes(value)) {
                throw new Error('Correct answer must be one of the options');
            }
            return true;
        }),

    validatorMiddleware
]

/*************** Update question validator ***************/
const updateQuestionValidator = [
    param('questionId')
        .isMongoId()
        .withMessage('Invalid question ID')
        .notEmpty()
        .withMessage('Question ID is required'),

    body('questionText')
        .optional()
        .isString()
        .withMessage('Question text must be a string'),

    body('options')
        .optional()
        .isArray()
        .withMessage('Options must be an array')
        .custom((value: string[]) => {
            if (value.length < 2) {
                throw new Error('At least two options are required');
            }
            return true;
        })
        .custom((value: string[]) => {
            if (value.length > 6) {
                throw new Error('Maximum of 6 options are allowed');
            }
            return true;
        }),

    body('correctAnswer')
        .optional()
        .isString()
        .withMessage('Correct answer must be a string')
        .custom((value: string, { req }) => {
            if (!req.body.options.includes(value)) {
                throw new Error('Correct answer must be one of the options');
            }
            return true;
        }),


    body().custom((value, { req }) => {
        if (!req.body.questionText && !req.body.options && !req.body.correctAnswer) {
            throw new Error('At least one field is required to update');
        }
        return true;
    }),


    validatorMiddleware

]


export {
    createQuestionValidator,
    updateQuestionValidator
}