import { Router } from "express";

import { isAuthenticated } from "../guards/isAuthenticated.guard";
import * as validation from '../validators/chatRoom.validator';
import * as controller from '../controllers/chat/chatRoom/index';
import { isAuthorized } from "../guards/isAuthorized.guard";
import { SystemRoles } from "../types/roles";

const router = Router()

/**
 * Defines routes for managing RoomMessage.
 */
// Handler to create a new chat room
router.post('/',
    isAuthenticated,
    isAuthorized(SystemRoles.teacher),
    validation.createRoomMessageValidator,
    controller.createRoomHandler
)

// Handler to get all RoomMessage of a specific chat room
router.get('/course/:courseId',
    isAuthenticated,
    isAuthorized(SystemRoles.teacher),
    controller.getRoomSpecificCourseHandler
)

// Handler to get all RoomMessage of a specific user
router.get('/user/:userId',
    isAuthenticated,
    isAuthorized(SystemRoles.student),
    controller.getRoomSpecificUserHandler
)

router.route('/:roomId')
    // Handler to get a chat room by id
    .get(
        isAuthenticated,
        isAuthorized(SystemRoles.teacher, SystemRoles.student),
        controller.getRoomByIdHandler
    )

    // Handler to add a participant to a chat room
    .post(
        isAuthenticated,
        isAuthorized(SystemRoles.teacher),
        controller.addParticipantHandler
    )
    // Handler to remove a participant from a chat room
    .delete(
        isAuthenticated,
        isAuthorized(SystemRoles.teacher),
        controller.removeParticipantHandler
    )




export const chatRoomRoutes = router;