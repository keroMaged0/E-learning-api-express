import { RequestHandler } from "express";

import { catchError } from "../../../middlewares/errorHandling.middleware";
import { SuccessResponse } from "../../../types/response";
import { ChatRoom } from "../../../models/chatRoom.models";
import { NotFoundError } from "../../../errors/notFoundError";
import { getIo } from "../../../utils/initSocketIo";
import { SOCKET_EVENTS } from "../../../types/socketEvents";

export const removeParticipantHandler: RequestHandler<
    unknown,
    SuccessResponse
> = catchError(
    async (req, res, next) => {
        const { roomId } = req.params
        const { _id } = req.loggedUser
        const { userId } = req.body

        const room = await ChatRoom.findById(roomId)
        if (!room) return next(new NotFoundError('Room not found'))

        // Check if the user is the owner of the room
        if (userId.toString() === _id.toString()) return next(new NotFoundError('You cannot remove yourself from the room'))

        // Check if the user is a participant of the room
        if (!room.participants.includes(userId)) return next(new NotFoundError('User not found in room'))

        room.participants = room.participants.filter(p => p.toString() !== userId.toString())
        await room.save()

        // Emit the event to the course room channel
        getIo().to(room.courseId).emit(SOCKET_EVENTS.removeUser, {
            userId,
            courseId: room.courseId,
        });


        return res.status(200).json({
            status: true,
            message: 'Participant removed',
            data: room
        })
    }
)

