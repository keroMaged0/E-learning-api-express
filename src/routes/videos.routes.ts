import { Router } from 'express';

import { uploadDiskStorage } from '../middlewares/multer.middleware';
import { isAuthenticated } from '../guards/isAuthenticated.guard';
import { isAuthorized } from '../guards/isAuthorized.guard';
import { allowedExtensions } from '../types/uploadOptions';
import * as validation from '../validators/video.validation'
import * as controller from '../controllers/videos'
import { SystemRoles } from '../types/roles';

const router = Router();


/**
 * Defines routes for managing videos.
 */
router.route('/')
    // Handler to create a new video
    .post(
        isAuthenticated,
        isAuthorized(SystemRoles.teacher),
        uploadDiskStorage({ fileType: allowedExtensions.video }).single('video'),
        validation.createVideosValidator,
        controller.createVideosHandler
    )

// Handler to get all Videos related to a course
router.get('/allVideos/:courseId',
    isAuthenticated,
    isAuthorized(SystemRoles.teacher, SystemRoles.student, SystemRoles.admin),
    controller.getAllVideosSpecificCourseHandler
)

router.route('/:videoId')
    // Handler to get a video by its ID
    .get(
        isAuthenticated,
        isAuthorized(SystemRoles.teacher, SystemRoles.student, SystemRoles.admin),
        controller.getVideosByIdHandler
    )
    // Handler to update a video
    .put(
        isAuthenticated,
        isAuthorized(SystemRoles.teacher),
        uploadDiskStorage({ fileType: allowedExtensions.video }).single('video'),
        validation.updateVideosValidator,
        controller.updateVideosHandler
    )
    // Handler to delete a video 
    .post(
        isAuthenticated,
        isAuthorized(SystemRoles.teacher),
        controller.deleteVideosHandler
    )
    // Handler to delete a video 
    .delete(
        isAuthenticated,
        isAuthorized(SystemRoles.teacher),
        controller.confirmDeleteVideosHandler
    )

export const videosRoutes = router;

