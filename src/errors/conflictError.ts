import { AppError } from "./appError";


export class ConflictError extends AppError {
    statusCode = 409;

    constructor(message?: string) {
        super(message || 'Conflict error');
    }

    serializeError() {
        return { status: false, code: this.statusCode, message: this.message, data: {} };
    }
}