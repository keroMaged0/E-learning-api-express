import { RequestHandler } from "express";

import { catchError } from "../../middlewares/errorHandling.middleware";
import { SuccessResponse } from "../../types/response";



export const getUserPaymentsHandler: RequestHandler<unknown, SuccessResponse> = catchError(
    async (req, res, next) => {

        res.status(200).json({
            status: true,
            message: ` successfully`,
            data: null,
        });
    }
);
