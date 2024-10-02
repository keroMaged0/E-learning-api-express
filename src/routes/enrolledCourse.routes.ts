import { Router } from "express";

import * as controller from "../controllers/enrolledCourse/index";
import { isAuthenticated } from "../guards/isAuthenticated.guard";
import { isAuthorized } from "../guards/isAuthorized.guard";
import { SystemRoles } from "../types/roles";

const router = Router();

/**
 * Defines routes for managing enrolledCourse.
 */

//Handler to get enrolled courses for a user
router.get("/user",
    isAuthenticated,
    isAuthorized(SystemRoles.student),
    controller.getEnrolledCoursesHandler
);

// //Handler to get enrolled course By Id for a user
// router.get("/user/:courseId",
//     isAuthenticated,
//     isAuthorized(SystemRoles.student),
//     controller.getEnrolledCourseByIdHandler
// );


export const enrolledCourseRouter = router;   