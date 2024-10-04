import { SOCKET_EVENTS } from "../../../types/socketEvents";
import { ChatRoom } from "../../../models/chatRoom.models";
import { getIo } from "../../../utils/initSocketIo";
import { logger } from "../../../config/logger";

export const addParticipantHandler = async ({ courseId, userId }) => {
    try {
        // Check if the user is already in the room
        const room = await ChatRoom.findOne({ courseId });
        if (!room) throw new Error('Room not found');

        // Check if the user is already in the room
        if (room.participants.includes(userId)) return;

        // Add the user to the room
        room.participants.push(userId);
        await room.save();

        getIo().join(`course_${courseId}`);
        getIo().of('/chat').to(`course_${courseId}`).emit(SOCKET_EVENTS.participantAdded, {
            roomId: room._id,
            participantId: userId,
            message: `User ${userId} has been added to the chat room`
        })

    } catch (error) {
        logger.error(error);
        return error
    }
}

