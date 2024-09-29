import { Router } from 'express';

import { isAuthenticated } from '../guards/isAuthenticated.guard';
import * as validation from '../validators/payment.validator';
import { isAuthorized } from '../guards/isAuthorized.guard';
import * as controller from '../controllers/payment/index';
import { SystemRoles } from '../types/roles';

const router = Router();

/**
 * Defines routes for managing payments.
 */

// Handler to initiate a payment
router.post('/initiate',
    isAuthenticated,
    isAuthorized(SystemRoles.student),
    validation.initiatePaymentValidator,
    controller.initiatePaymentHandler
);

// Handler to check payment status
router.get('/:paymentId/status',
    isAuthenticated,
    isAuthorized(SystemRoles.student),
    validation.checkPaymentStatusValidator,
    controller.checkPaymentStatusHandler
);

// Handler to get all payments for a user
router.get('/user/:userId',
    isAuthenticated,
    isAuthorized(SystemRoles.student),
    validation.getUserPaymentsValidator,
    controller.getUserPaymentsHandler
);

// Handler to cancel a payment
router.delete('/:paymentId',
    isAuthenticated,
    isAuthorized(SystemRoles.student),
    validation.cancelPaymentValidator,
    controller.cancelPaymentHandler
);



export const paymentsRoutes = router;
