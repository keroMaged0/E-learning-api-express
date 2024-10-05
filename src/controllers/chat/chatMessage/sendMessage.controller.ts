import { RequestHandler } from "express";

import { catchError } from "../../../middlewares/errorHandling.middleware";
import { SuccessResponse } from "../../../types/response";
import { ChatRoom } from "../../../models/chatRoom.models";
import { NotFoundError } from "../../../errors/notFoundError";
import { ChatMessage } from "../../../models/chatMessage.model";
import { getIo } from "../../../utils/initSocketIo";
import { SOCKET_EVENTS } from "../../../types/socketEvents";



export const sendMessageHandler: RequestHandler<
    unknown,
    SuccessResponse
> = catchError(
    async (req, res, next) => {
        const { content } = req.body;
        const { _id } = req.loggedUser;

        // get chat Room information
        const room = await ChatRoom.findOne({ participants: { $in: [_id] } });
        if (!room) return next(new NotFoundError('Room not found'));

        // save message to the database
        const newMessage = new ChatMessage({
            senderId: _id,
            roomId: room._id,
            content
        });

        await newMessage.save();

        // emit new message to the room
        getIo().to(room.courseId.toString()).emit(SOCKET_EVENTS.sendMessage, newMessage);

        return res.status(200).json({
            status: true,
            message: 'Message sent successfully',
            data: newMessage
        });

    }
)

