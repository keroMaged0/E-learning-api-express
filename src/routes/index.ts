import { Router } from 'express';

import { enrolledCourseRouter } from './enrolledCourse.routes';
import { paymentsRoutes } from './payment.routes';
import { lessonsRoutes } from './lessons.routes';
import { coursesRoutes } from './courses.routes';
import { videosRoutes } from './videos.routes';
import { reviewRoutes } from './review.routes';
import { usersRoutes } from './users.routes';
import { authRoutes } from './auth.routes';


const router = Router();

/*************** routes handlers ***************/
router.use('/enrolledCourse', enrolledCourseRouter);
router.use('/payment', paymentsRoutes);
router.use('/courses', coursesRoutes);
router.use('/lessons', lessonsRoutes);
router.use('/videos', videosRoutes);
router.use('/review', reviewRoutes);
router.use('/users', usersRoutes);
router.use('/auth', authRoutes);


export const apiRoutes = router;
