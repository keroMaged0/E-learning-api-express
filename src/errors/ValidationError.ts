import { ValidationError as valError } from 'express-validator';


import { AppError } from "./appError"
import { ValidationErrorResponse } from '../types/response';


export class ValidationError extends AppError {
    statusCode = 422;

    constructor(public errors: valError[]) {
        super('validation error')
    }

    serializeError(): ValidationErrorResponse {
        return this.errors.map((err) => {
            if (err.type === 'field') return { message: err.msg, field: err.path };
            return { message: err.msg };
        });
    }
}