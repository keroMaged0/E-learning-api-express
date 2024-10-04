import { NotFoundError } from "../../../errors/notFoundError";
import { SOCKET_EVENTS } from "../../../types/socketEvents";
import { ChatRoom } from "../../../models/chatRoom.models";
import { getIo } from "../../../utils/initSocketIo";
import { logger } from "../../../config/logger";

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

        // Emit socket event to create a new room for the course
        const courseRoom = `course_${courseId}`;
        await getIo().emit(SOCKET_EVENTS.createRoom, courseRoom);

    } catch (error) {
        logger.error(error)
        next(error);
    }
}



