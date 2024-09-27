import { Router } from 'express';

import { uploadDiskStorage } from '../middlewares/multer.middleware';
import { isAuthenticated } from '../guards/isAuthenticated.guard';
import { isAuthorized } from '../guards/isAuthorized.guard';
import * as validation from '../validators/user.validator'
import * as controller from '../controllers/users'
import { SystemRoles } from '../types/roles';

const router = Router();


router.route('/profile')
    .all(
        isAuthenticated,
        isAuthorized(
            SystemRoles.teacher,
            SystemRoles.student
        )
    )
    // Handle GET request to retrieve the logged-in user's profile
    .get(
        controller.getLoggedProfileHandler
    )
    // Handle POST request to create a new profile image
    .post(
        uploadDiskStorage().single('profileImage'),
        controller.createProfileImageHandler
    )
    // Update user profile with image upload and validation
    .put(
        uploadDiskStorage().single('profileImage'),
        validation.updateProfileValidator,
        controller.updateProfileHandler
    )

// Route accessible only by admin to retrieve user analysis data
router.get('/analysis',
    isAuthenticated,
    isAuthorized(SystemRoles.admin),
    controller.userAnalysisHandler

)



export const usersRoutes = router;

