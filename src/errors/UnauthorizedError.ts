import { ErrorResponse } from "../types/response";
import { AppError } from "./appError"

export class UnauthorizedError extends AppError {
    statusCode = 401;

    constructor(message?: string) {
        super(message || "unauthorized error");
    }

    serializeError(): ErrorResponse {
        return { status: false, code: this.statusCode, message: this.message, data: {} };
    }
}