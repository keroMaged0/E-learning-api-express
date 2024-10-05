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
router.route('/:roomId')
    // Handler to get a chat room by id
    .get(
        isAuthenticated,
        isAuthorized(SystemRoles.teacher, SystemRoles.student),
        controller.getRoomByIdHandler
    )
    // Handler to remove a participant from a chat room
    .delete(
        isAuthenticated,
        isAuthorized(SystemRoles.teacher),
        // validation.removeParticipantValidator,
        controller.removeParticipantHandler
    )

export const chatRoomRoutes = router;