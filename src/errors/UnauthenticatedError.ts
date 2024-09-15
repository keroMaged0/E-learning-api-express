import { ErrorResponse } from "../types/response";
import { AppError } from "./appError"

export class UnauthenticatedError extends AppError {
    statusCode = 401;

    constructor(message?: string) {
        super(message || "unauthenticated");
    }

    serializeError(): ErrorResponse {
        return { status: false, code: this.statusCode, message: this.message, data: {} };
    }
}