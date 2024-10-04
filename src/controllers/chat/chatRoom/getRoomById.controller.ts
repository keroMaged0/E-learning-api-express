import { RequestHandler } from "express";

import { checkEnrolledCourse } from "../../enrolledCourse/checkEnrolledCourse.controller";
import { catchError } from "../../../middlewares/errorHandling.middleware";
import { NotFoundError } from "../../../errors/notFoundError";
import { ChatRoom } from "../../../models/chatRoom.models";
import { SuccessResponse } from "../../../types/response";
import { getIo } from "../../../utils/initSocketIo";
import { SOCKET_EVENTS } from "../../../types/socketEvents";



export const getRoomByIdHandler: RequestHandler<
    unknown,
    SuccessResponse
> = catchError(
    async (req, res, next) => {
        const { roomId } = req.params;
        const { _id } = req.loggedUser;

        const room = await ChatRoom.findById(roomId);
        if (!room) return next(new NotFoundError('Room not found'));

        await checkEnrolledCourse({ courseId: room.courseId, userId: _id, next });

        // getIo().of('/chat').to(`course-${room.courseId}`).on(SOCKET_EVENTS.roomRetrieved, {
        //     roomId: room._id,
        //     message: `Chat room ${roomId} retrieved successfully`
        // });

        return res.status(200).json({
            status: true,
            message: 'Data retrieved',
            data:    room
        });
    }
)

