import { RequestHandler } from "express";

import { catchError } from "../../../middlewares/errorHandling.middleware";
import { SuccessResponse } from "../../../types/response";



export const removeParticipantHandler:RequestHandler<
    unknown,
    SuccessResponse
> = catchError(
    async (req, res, next) => {
      
    }
)

