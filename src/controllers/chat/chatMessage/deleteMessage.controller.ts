import { RequestHandler } from "express";

import { catchError } from "../../../middlewares/errorHandling.middleware";
import { ChatMessage } from "../../../models/chatMessage.model";
import { NotFoundError } from "../../../errors/notFoundError";
import { SOCKET_EVENTS } from "../../../types/socketEvents";
import { ChatRoom } from "../../../models/chatRoom.models";
import { SuccessResponse } from "../../../types/response";
import { getIo } from "../../../utils/initSocketIo";



export const deleteMessageHandler: RequestHandler<
    unknown,
    SuccessResponse
> = catchError(
    async (req, res, next) => {
        const { messageId } = req.params;
        const { _id } = req.loggedUser;

        // get message information
        const message = await ChatMessage.findById(messageId);
        if (!message) return next(new NotFoundError('Message not found'));

        // check if the user is the owner of the message
        if (message.senderId.toString() !== _id.toString()) return next(new NotFoundError('Unauthorized to delete this message'));

        // delete the message
        await message.deleteOne({ _id: messageId });

        const room = await ChatRoom.findById(message.chatRoomId);
        if (!room) return next(new NotFoundError('Chat room not found'));
        
        // socket.io to emit message deleted
        getIo().to(room?.courseId).emit(SOCKET_EVENTS.deleteMessage, `Message ${messageId} has been deleted`);
        
        res.status(200).json({
            status: true,
            message: 'Message deleted successfully',
        });

    }
)

