import { NotFoundError } from "../../../errors/notFoundError";
import { ChatRoom } from "../../../models/chatRoom.models";
import { getIo } from "../../../utils/initSocketIo";
import { logger } from "../../../utils/logger";
import { SOCKET_EVENTS } from "../../../types/socketEvents";

export const createRoomHandler = async ({ courseId, instructorId, next }) => {
    try {
        // Check if room already exists
        const roomExists = await ChatRoom.findOne({ courseId });
        if (roomExists) return next(new NotFoundError('Room already exists'));

        // Create a new room 
        await ChatRoom.create({
            courseId: courseId,
            participants: [instructorId],
        });

        getIo().to(courseId).emit(SOCKET_EVENTS.message, `Welcome to the course ${courseId}`);
        // getIo().emit(SOCKET_EVENTS.message, `Welcome to the course ${courseId}`);
        // getIo().of("/").adapter.rooms.set(courseId, new Set([instructorId]));

        return true;
    } catch (error) {
        logger.error(error)
        next(error);
        return false;
    }
}



