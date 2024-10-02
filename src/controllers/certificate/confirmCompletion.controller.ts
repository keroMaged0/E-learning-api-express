import { RequestHandler } from "express";
import { catchError } from "../../middlewares/errorHandling.middleware";
import { SuccessResponse } from "../../types/response";


export const Handler:RequestHandler<
    unknown,
    SuccessResponse
> = catchError(
    async (req, res, next) => {
      
    }
)

