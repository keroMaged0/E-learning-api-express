
import { ErrorResponse, ValidationErrorResponse } from '../types/response';
import { AppError } from './appError';

export class NotFoundError extends AppError {
    statusCode = 404;
    constructor(message?: string) {
        super(message || 'Not Found');
    }
    serializeError(): ErrorResponse | ValidationErrorResponse {
        return { status: false, code: this.statusCode, message: this.message, data: {} };
    }
}