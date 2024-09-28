import { Router } from 'express';

import { paymentsRoutes } from './payment.routes';
import { lessonsRoutes } from './lessons.routes';
import { coursesRoutes } from './courses.routes';
import { videosRoutes } from './videos.routes';
import { usersRoutes } from './users.routes';
import { authRoutes } from './auth.routes';


const router = Router();

/*************** routes handlers ***************/
router.use('/payment', paymentsRoutes);
router.use('/courses', coursesRoutes);
router.use('/lessons', lessonsRoutes);
router.use('/videos', videosRoutes);
router.use('/users', usersRoutes);
router.use('/auth', authRoutes);


export const apiRoutes = router;
