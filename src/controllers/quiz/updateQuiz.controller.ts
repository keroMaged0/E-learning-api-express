import { RequestHandler } from "express";

import { catchError } from "../../middlewares/errorHandling.middleware";
import { findCourseById } from "../../services/entities/course.service";
import { findQuizById } from "../../services/entities/quiz.service";
import { NotFoundError } from "../../errors/notFoundError";
import { SuccessResponse } from "../../types/response";
import { Courses } from "../../models/course.models";

/**
 * Handler to update a quiz.
 * 
 * This handler updates the quiz's title, description, and associated course ID 
 * if the user is authorized to make changes to the quiz.
 * 
 * @param {Request} req - The request object containing the quiz ID in the parameters and the updated fields in the body.
 * @param {Response} res - The response object used to send the updated quiz.
 * @param {NextFunction} next - The next middleware function to call in case of an error.
 * 
 * @returns {Promise<void>} - A promise that resolves to void.
 * 
 * @throws {NotFoundError} - Throws an error if the quiz or course is not found.
 * @throws {UnauthorizedError} - Throws an error if the instructor is not authorized to update the quiz.
 */
export const updateQuizHandler: RequestHandler<
    unknown,
    SuccessResponse
> = catchError(
    async (req, res, next) => {
        const { title, description, courseId } = req.body;
        const { _id } = req.loggedUser;
        const { quizId } = req.params;

        // Check if the quiz exists
        const quiz = await findQuizById(quizId, next);

        // Check if the course exists
        const course = await findCourseById(quiz.courseId, next)

        // Check if the logged user is the instructor of the course
        if (course.instructorId.toString() !== _id.toString()) return next(new NotFoundError('Unauthorized instructor'));

        // Update the quiz title if provided and different from the previous one
        if (title) {
            if (quiz.title === title) return next(new NotFoundError('Title is same as previous'));
            quiz.title = title;
        }

        // Update the quiz description if provided and different from the previous one
        if (description) {
            if (quiz.description === description) return next(new NotFoundError('Description is same as previous'));
            quiz.description = description;
        }

        // Update the associated course ID if provided
        if (courseId) {
            const newCourse = await Courses.findById(courseId);
            if (!newCourse) return next(new NotFoundError('Course not found'));

            // Check if the new course is the same as the previous one
            if (newCourse._id.toString() === quiz.courseId.toString()) {
                return next(new NotFoundError('Course is same as previous'));
            }

            // Check if the logged user is the instructor of the new course
            if (newCourse.instructorId.toString() !== _id.toString()) {
                return next(new NotFoundError('Unauthorized instructor'));
            }

            quiz.courseId = courseId;
        }

        await quiz.save();
        res.status(200).json({
            status: true,
            message: 'Quiz updated successfully',
            data: quiz
        });

    }
)