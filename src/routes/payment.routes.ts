import { Router } from 'express';

import { isAuthenticated } from '../guards/isAuthenticated.guard';
import * as controller from '../controllers/payment/index';
import { isAuthorized } from '../guards/isAuthorized.guard';
import { SystemRoles } from '../types/roles';

const router = Router();

/**
 * Defines routes for managing payments.
 */

// Handler to initiate a payment
router.post('/initiate',
    isAuthenticated,
    isAuthorized(SystemRoles.student),
    controller.initiatePaymentHandler
);

// Handler to check payment status
router.get('/:paymentId/status',
    isAuthenticated,
    controller.checkPaymentStatusHandler
);

// Handler to create a new payment record
router.post('/',
    isAuthenticated,
    controller.createPaymentHandler
);

// Handler to get all payments for a user
router.get('/user/:userId',
    isAuthenticated,
    controller.getUserPaymentsHandler
);

// Handler to cancel a payment
router.delete('/:paymentId',
    isAuthenticated,
    controller.cancelPaymentHandler
);

// Handler to update payment status
router.patch('/:paymentId',
    isAuthenticated,
    controller.updatePaymentStatusHandler
);

export const paymentsRoutes = router;
