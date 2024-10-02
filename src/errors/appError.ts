import { ErrorResponse, ValidationErrorResponse } from "types/response";



/*************** App Error ***************/
export abstract class AppError extends Error {
    abstract statusCode: number;
    constructor(message: string) {
        super(message);
    }

    abstract serializeError(): ErrorResponse | ValidationErrorResponse;
}   