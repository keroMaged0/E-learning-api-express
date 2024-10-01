import { body } from "express-validator"
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

/*************** Download certificate validator ***************/
const downloadCertificateValidator = []

/*************** Get certificate validator ***************/
const getCertificateValidator = []

/*************** Update certificate validator ***************/
const updateCertificateValidator = []

/*************** Delete certificate validator ***************/
const deleteCertificateValidator = []

export {
   createCertificateValidator,
   downloadCertificateValidator,
   getCertificateValidator,
   updateCertificateValidator,
   deleteCertificateValidator
}