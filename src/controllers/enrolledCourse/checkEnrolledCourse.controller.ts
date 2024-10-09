import { findCourseById } from "../../services/entities/course.service";
import { findUserById } from "../../services/entities/user.service";
import { NotFoundError } from "../../errors/notFoundError";
import { Enrolled } from "../../models/enrolled.model";
import { SystemRoles } from "../../types/roles";

/**
 * Function to check if a user is enrolled in a course or authorized to access it.
 * 
 * This function validates whether a user is enrolled in a specific course or has
 * the necessary permissions to access the course based on their role (student or teacher).
 * 
 * @param {Object} params - The function parameters.
 * @param {string} params.courseId - The ID of the course to check.
 * @param {string} params.userId - The ID of the user making the request.
 * @param {Function} params.next - The next middleware function to call in case of an error.
 * 
 * @returns {Promise<boolean>} - Returns true if the user is authorized or enrolled.
 * 
 * @throws {NotFoundError} - Throws an error if the course or user is not found, or if the user is not authorized.
 */
export const checkEnrolledCourse = async ({ courseId, userId, next }) => {
    // Check if the course exists
    const course = await findCourseById(courseId, next);

    // Check if the user exists
    const user = await findUserById(userId, next);

    // If the user is a student, check if they are enrolled in the course
    if (user.role === SystemRoles.student) {
        const enrolledCourses = Enrolled.findOne({ userId, courseId });
        if (!enrolledCourses) return next(new NotFoundError('Course not found'));
    }

    // If the user is a teacher, check if they are the instructor of the course
    if (user.role === SystemRoles.teacher) {
        if (course.instructorId.toString() !== user._id.toString()) {
            return next(new NotFoundError('Unauthorized instructor'));
        }
    }

    return true;
}