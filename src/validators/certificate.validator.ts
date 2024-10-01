import { body, param } from "express-validator"
import { validatorMiddleware } from "../middlewares/validator.middleware"


/*************** Create certificate validator ***************/
const createCertificateValidator = [
   body('courseId')
      .isMongoId()
      .withMessage('Invalid course ID')
      .notEmpty()
      .withMessage('Course ID is required'),

   body('userId')
      .isMongoId()
      .withMessage('Invalid course ID')
      .notEmpty()
      .withMessage('User ID is required'),

   body('title')
      .notEmpty()
      .withMessage('Title is required')
      .isString()
      .isLength({ min: 5, max: 100 }),

   validatorMiddleware
]


/*************** Update certificate validator ***************/
const updateCertificateValidator = [
   param('certificateId')
      .isMongoId()
      .withMessage('Invalid certificate ID')
      .notEmpty()
      .withMessage('Certificate ID is required'),

   body('courseId')
      .isMongoId()
      .withMessage('Invalid course ID')
      .optional(),

   body('userId')
      .isMongoId()
      .withMessage('Invalid course ID')
      .optional(),

   body('title')
      .isString()
      .isLength({ min: 5, max: 100 })
      .optional(),

      body().custom((value, { req }) => {
         if (!req.body.title &&!req.body.courseId &&!req.body.userId) {
            throw new Error('At least one field must be updated')
         }
         return true
      }),

   validatorMiddleware
]


export {
   createCertificateValidator,
   updateCertificateValidator,
}