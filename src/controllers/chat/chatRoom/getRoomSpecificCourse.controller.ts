import { RequestHandler } from "express";

import { checkEnrolledCourse } from "../../enrolledCourse/checkEnrolledCourse.controller";
import { catchError } from "../../../middlewares/errorHandling.middleware";
import { NotFoundError } from "../../../errors/notFoundError";
import { ChatRoom } from "../../../models/chatRoom.models";
import { SuccessResponse } from "../../../types/response";
import { Courses } from "../../../models/course.models";
import { io } from "../../../socket";



export const getRoomSpecificCourseHandler: RequestHandler<
    unknown,
    SuccessResponse
> = catchError(
    async (req, res, next) => {
        const { courseId } = req.params;
        const { _id } = req.loggedUser;

        const course = await Courses.findById(courseId);
        if (!course) return next(new NotFoundError('Course not found'));

        await checkEnrolledCourse({ courseId, userId: _id, next });

        const room = await ChatRoom.findOne({ courseId });
        if (!room) return next(new NotFoundError('Room not found'));

        // const roomId = room._id as string;
        req.socket.emit('roomRetrieved', room);     
        return res.status(200).json({
            status: true,
            message: 'data retrieved',
            data: room
        });
    }
)

