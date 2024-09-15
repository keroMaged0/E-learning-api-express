import { ErrorRequestHandler } from "express";
import { MulterError } from 'multer';

import { ErrorResponse } from "../types/response";
import { env } from "../config/env";
import { logger } from "../config/logger";
import { AppError } from "../errors/appError";


/******************** Error handling middleware ********************/
export const ErrorHandlerMiddleware: ErrorRequestHandler<unknown, ErrorResponse> = (
    err,
    req,
    res,
    next,
) => {

    // check if error 
    logger.error(err)
    if (env.environment === 'development') console.log(err);

    // custom error
    if (err instanceof AppError) return res.status(err.statusCode).json(err.serializeError() as ErrorResponse);

    // mongoose validation duplicate error
    if (err.name === 'MongoServerError' && err.code == '11000')
        return res.status(400).json({
            status: false,
            code: 400,
            message: `${Object.keys(err.keyPattern)} is already exists`,
            data: {},
        });

    // unhandled multer error
    if (err instanceof MulterError)
        return res.status(400).json({
            status: false, code: 400, message: `${err.field} is invalid`, data: err.message
        });

    // JWT invalid token
    if (err.name === 'JsonWebTokenError')
        return res.status(401).json({
            status: false,
            code: 401,
            message: 'invalid token',
            data: {},
        });

    // JWT expired token
    if (err.name === 'TokenExpiredError')
        return res.status(401).json({
            status: false,
            code: 401,
            message: 'expired token',
            data: {},
        });

    // unHandled error
    res.status(500).json({
        status: false,
        code: 500,
        message: 'Internal server error',
        data: {},
    });

    next();
}


/******************** catch Error middleware ********************/
export const catchError = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch((err) =>
            next(err)
        );

    };
}