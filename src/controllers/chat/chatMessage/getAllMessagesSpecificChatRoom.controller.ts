    import { RequestHandler } from "express";

    import { catchError } from "../../../middlewares/errorHandling.middleware";
    import { SuccessResponse } from "../../../types/response";
    import { ChatRoom } from "../../../models/chatRoom.models";
    import { NotFoundError } from "../../../errors/notFoundError";
    import { ChatMessage } from "../../../models/chatMessage.model";
    import { getIo } from "../../../utils/initSocketIo";
    import { SOCKET_EVENTS } from "../../../types/socketEvents";



    export const getAllMessagesSpecificChatRoomHandler: RequestHandler<
        unknown,
        SuccessResponse
    > = catchError(
        async (req, res, next) => {
            const { chatRoomId } = req.params;
            const { _id } = req.loggedUser;

            // get chat Room information
            const chatRoom = await ChatRoom.findById(chatRoomId);
            if (!chatRoom) return next(new NotFoundError('Chat room not found'));

            // check if chat room has the user
            if (!chatRoom.participants.some(p => p._id.toString() === _id.toString())) {
                return next(new NotFoundError('User not found in the chat room'));
            }

            // get all messages in the chat room
            const messages = await ChatMessage.find({chatRoomId: chatRoom._id});
            if (!messages) return next(new NotFoundError('No message found'));

            getIo().to(chatRoom.courseId.toString()).emit(SOCKET_EVENTS.messages, messages);

            res.status(200).json({
                status: true,
                message: 'data retrieved successfully',
                data: messages,
            });

        }
    )

