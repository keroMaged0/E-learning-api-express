import { Router } from 'express';

import { coursesRoutes } from './courses.routes';
import { lessonsRoutes } from './lessons.routes';
import { videosRoutes } from './videos.routes';
import { paymentsRoutes } from './payment.routes';
import { usersRoutes } from './users.routes';
import { authRoutes } from './auth.routes';


const router = Router();

/*************** routes handlers ***************/
router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/courses', coursesRoutes);
router.use('/lessons', lessonsRoutes);
router.use('/videos', videosRoutes);
router.use('/payment', paymentsRoutes);


export const apiRoutes = router;
