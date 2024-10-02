import { RequestHandler } from "express";

import { catchError } from "../../../middlewares/errorHandling.middleware";
import { SuccessResponse } from "../../../types/response";
import { ChatRoom } from "../../../models/chatRoom.models";
import { NotFoundError } from "../../../errors/notFoundError";



export const getRoomSpecificUserHandler: RequestHandler<
    unknown,
    SuccessResponse
> = catchError(
    async (req, res, next) => {
        const { userId } = req.params;
        const { _id } = req.loggedUser;

        const room = await ChatRoom.findOne({ participants: { $all: [userId, _id] } });
        console.log('====================================');
        console.log(room);
        console.log('====================================');
        if (!room) return next(new NotFoundError('Room not found'));

        req.socket.emit('roomRetrieved', room);

        return res.status(200).json({
            status: true,
            message: 'data retrieved',
            data: room
        });

    }
)

