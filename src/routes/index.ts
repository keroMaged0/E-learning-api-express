import { Router } from 'express';

import { enrolledCourseRouter } from './enrolledCourse.routes';
import { certificateRoutes } from './certificate.routes';
import { chatMessageRoutes } from './chatMessage.routes';
import { chatRoomRoutes } from './chatRoom.routes';
import { questionRoutes } from './question.routes';
import { paymentsRoutes } from './payment.routes';
import { coursesRoutes } from './courses.routes';
import { lessonsRoutes } from './lessons.routes';
import { videosRoutes } from './videos.routes';
import { reviewRoutes } from './review.routes';
import { usersRoutes } from './users.routes';
import { authRoutes } from './auth.routes';
import { quizRoutes } from './quiz.routes';


const router = Router();

/*************** routes handlers ***************/
router.use('/enrolledCourse', enrolledCourseRouter);
router.use('/chatRoom/message', chatMessageRoutes);
router.use('/certificate', certificateRoutes);
router.use('/chatRoom', chatRoomRoutes);
router.use('/question', questionRoutes);
router.use('/payment', paymentsRoutes);
router.use('/courses', coursesRoutes);
router.use('/lessons', lessonsRoutes);
router.use('/videos', videosRoutes);
router.use('/review', reviewRoutes);
router.use('/users', usersRoutes);
router.use('/auth', authRoutes);
router.use('/quiz', quizRoutes);


export const apiRoutes = router;
