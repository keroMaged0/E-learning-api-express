import { Router } from 'express';

import { isAuthenticated } from '../guards/isAuthenticated.guard';
import { isauthorized } from '../guards/isAuthorized.guard';
import * as validation from '../validators/auth.validator'
import * as controller from '../controllers/auth'
import { SystemRoles } from '../types/roles';
// import { uploadMemoryStorage } from '../middlewares/multer.middleware';

// const uploadProfileImage = uploadMemoryStorage().single('profileImage')
// uploadProfileImage,  // Multer middleware for profile image upload

const router = Router();

// Mock route for user registration
router.post('/signUp',
    validation.signupValidator,
    controller.signUpHandler,
);

// Mock route for user login
router.post('/signIn',
    validation.signinValidator,
    controller.signInHandler
);

// verify email route handlers
router.post('/verificationCode/verify',
    validation.verifyValidator,
    controller.verifyEmailHandler,
)

// resend code to email route handlers
router.post('/verificationCode/resend',
    validation.resendVerificationCodeValidator,
    controller.resendVerificationCodeHandlerL,
)

// two factor authentication route handlers
router.get('/2fa/generate',
    isAuthenticated,
    isauthorized(SystemRoles.student, SystemRoles.teacher),
    controller.generate2faHandler,
)

// enable two factor authentication route handlers
router.post('/2fa/enable',
    isAuthenticated,
    isauthorized(SystemRoles.student, SystemRoles.teacher),
    validation.enable2faValidator,
    controller.enable2faHandler,
)

// login with 2fa route handlers
router.post('/login/2fa',
    validation.login2faValidator,
    controller.login2faHandler,
)

// refresh token route handlers
router.post('/refreshToken',
    validation.refreshTokenValidator,
    controller.refreshTokenHandler,
)

// change password route handlers
router.patch('/password',
    isAuthenticated,
    isauthorized(SystemRoles.student, SystemRoles.teacher),
    validation.updatePasswordValidator,
    controller.updatePasswordHandler,
)

// forgot password route handlers
router.route('/forgetPassword')
    .post(
        validation.forgetPasswordValidator,
        controller.forgetPasswordHandler,
    )
    .put(
        validation.updateForgetPasswordValidator,
        controller.updateForgetPasswordHandler
    )


// logout route handlers
router.get('/logout',
    isAuthenticated,
    isauthorized(SystemRoles.student, SystemRoles.teacher),
    controller.logoutHandler,
)

export const authRoutes = router;

