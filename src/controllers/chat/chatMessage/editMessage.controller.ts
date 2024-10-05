import { RequestHandler } from "express";

import { catchError } from "../../../middlewares/errorHandling.middleware";
import { SuccessResponse } from "../../../types/response";
import { ChatMessage } from "../../../models/chatMessage.model";
import { NotFoundError } from "../../../errors/notFoundError";
import { getIo } from "../../../utils/initSocketIo";
import { ChatRoom } from "../../../models/chatRoom.models";
import { SOCKET_EVENTS } from "../../../types/socketEvents";



export const editMessageHandler: RequestHandler<
    unknown,
    SuccessResponse
> = catchError(
    async (req, res, next) => {
        const { content } = req.body;
        const { messageId } = req.params
        const { _id } = req.loggedUser;

        // get message information
        const message = await ChatMessage.findById(messageId);
        if (!message) return next(new NotFoundError('Message not found'));

        // check if the user is the owner of the message
        if (message.senderId.toString() !== _id.toString()) return next(new NotFoundError('Unauthorized to edit this message'));

        // update the message content
        message.content = content;

        await message.save();

        const chatRoom = await ChatRoom.findOne({ _id: message.chatRoomId });
        if (!chatRoom) return next(new NotFoundError('Chat room not found'));

        getIo().to(chatRoom?.courseId.toString()).emit(SOCKET_EVENTS.editMessage, message);

        res.status(200).json({
            status: true,
            message: 'Message edited successfully',
            data: message
        });

    }
)

