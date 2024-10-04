import { logger } from "../../config/logger";
import { Enrolled } from "../../models/enrolled.model";

export const createEnrolledCourseHandler = async ({ userId, courseId, paymentId }) => {
    try {
        const enrolledExist = await Enrolled.findOne({ userId, courseId })
        if (enrolledExist) return;

        const enrolledCourse = new Enrolled({ userId, courseId, paymentId });

        await enrolledCourse.save();
    } catch (error) {
        logger.error(error);
        return error
    }

}