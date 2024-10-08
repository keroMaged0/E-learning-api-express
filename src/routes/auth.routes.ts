import { Router } from 'express';

import { isAuthenticated } from '../guards/isAuthenticated.guard';
import { isAuthorized } from '../guards/isAuthorized.guard';
import * as validation from '../validators/auth.validator'
import * as controller from '../controllers/auth'
import { SystemRoles } from '../types/roles';


const router = Router();

// route for user registration
router.post('/signUp',
    validation.signupValidator,
    controller.signUpHandler,
);

// route for user login
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
    controller.resendVerificationCodeHandler,
)

// two factor authentication route handlers
router.get('/2fa/generate',
    isAuthenticated,
    isAuthorized(SystemRoles.student, SystemRoles.teacher),
    controller.generate2faHandler,
)

// enable two factor authentication route handlers
router.post('/2fa/enable',
    isAuthenticated,
    isAuthorized(SystemRoles.student, SystemRoles.teacher),
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
    isAuthorized(SystemRoles.student, SystemRoles.teacher),
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


export const authRoutes = router;

