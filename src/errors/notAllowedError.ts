import { AppError } from "./appError";


export class NotAllowedError extends AppError {
    statusCode = 405;

    constructor(message: string) {
        super(message);
    }

    serializeError() {
        return { status: false, code: this.statusCode, message: this.message, data: {} };
    }
}