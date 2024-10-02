import { RequestHandler } from "express";

import { catchError } from "../../../middlewares/errorHandling.middleware";
import { NotFoundError } from "../../../errors/notFoundError";
import { ChatRoom } from "../../../models/chatRoom.models";
import { SuccessResponse } from "../../../types/response";
import { Courses } from "../../../models/course.models";
// import { EnrolledCourse } from "../../../models/enrolledCourse.models";
import { io } from "../../../socket";


export const createRoomHandler: RequestHandler<
    unknown,
    SuccessResponse
> = catchError(
    async (req, res, next) => {
        const { courseId } = req.body;
        const { _id } = req.loggedUser;

        const roomExists = await ChatRoom.findOne({ courseId });
        if (roomExists) return next(new NotFoundError('Room already exists'));

        const course = await Courses.findById(courseId);
        if (!course) return next(new NotFoundError('Course not found'));
        if (course.instructorId.toString() !== _id.toString()) {
            return next(new NotFoundError('Unauthorized instructor'));
        }

        const participants: string[] = [];

        // const allEnrolled = await EnrolledCourse.find({ courseId })
        // console.log('====================================');
        // console.log(allEnrolled);
        // console.log('====================================');

        // for (const participant of allEnrolled) {
        //     participants.push(participant.userId.toString())
        // }

        const chatRoom = await ChatRoom.create({ courseId, participants });

        io.emit('chatRoomCreated', chatRoom);

        return res.status(201).json({
            status: true,
            message: 'Room created',
            data: chatRoom
        });


    }
)

