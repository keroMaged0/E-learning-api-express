import { Router } from "express";

import { isAuthenticated } from "../guards/isAuthenticated.guard";
import * as validation from '../validators/chatMessage.validator';
import * as controller from '../controllers/chat/chatMessage/index';
import { isAuthorized } from "../guards/isAuthorized.guard";
import { SystemRoles } from "../types/roles";

const router = Router()

/**
 * Defines routes for managing chatMessage.
 */

// Handler to send a new message
router.post('/',
    isAuthenticated,
    isAuthorized(SystemRoles.teacher, SystemRoles.student),
    validation.createChatMessageValidator,
    controller.sendMessageHandler
)

// Handler to get all messages of a specific chatRoom
router.get('/ChatRoom/:chatRoomId',
    isAuthenticated,
    isAuthorized(SystemRoles.teacher, SystemRoles.student),
    controller.getAllMessagesSpecificChatRoomHandler
)

router.route('/:messageId')
    // Handler to update a message
    .patch(
        isAuthenticated,
        isAuthorized(SystemRoles.teacher, SystemRoles.student),
        validation.updateChatMessageValidator,
        controller.editMessageHandler
    )

    // Handler to delete a message
    .delete(
        isAuthenticated,
        isAuthorized(SystemRoles.teacher, SystemRoles.student),
        controller.deleteMessageHandler
    )



export const chatMessageRoutes = router;