import { RequestHandler } from "express";

import { catchError } from "../../middlewares/errorHandling.middleware";
import { EnrolledCourse } from "../../models/enrolledCourse.models";
import { SuccessResponse } from "../../types/response";


/**
 * Handler function to retrieve a specific enrolled course by its ID for the logged-in user.
 * This function extracts the course ID from the request parameters and the user ID from
 * the logged-in user's information. It queries the EnrolledCourse model to find
 * the enrolled course associated with the user and the provided course ID.
 * The function uses the populate method to include detailed information about the 
 * course, including its lessons and related videos.
 * 
 * @param {Request} req - The request object containing the course ID and user information.
 * @param {Response} res - The response object used to send a response back to the client.
 * @param {NextFunction} next - The next middleware function in the stack.
 * @returns {Promise<void>} - A promise that resolves to void.
 * @throws {NotFoundError} - Throws an error if no enrolled course is found for the user.
 */
export const getEnrolledCourseByIdHandler: RequestHandler<
    unknown,
    SuccessResponse
> = catchError(
    async (req, res, next) => {
        const { courseId } = req.params;
        const { _id } = req.loggedUser;

        const enrolledData = await EnrolledCourse.find({ userId: _id, courseId: courseId })
            .populate({
                path: 'courseId',
                populate: {
                    path: 'lessonsId',
                    select: 'title duration videoId imageCover createdAt updatedAt',
                    populate: {
                        path: 'videoId',
                    }
                },


            })
            .exec();
        if (!enrolledData || enrolledData.length === 0) return res.status(200).json({ message: "No courses enrolled" })

        const data = enrolledData[0]


        res.status(200).json({
            status: true,
            message: 'data retrieved successfully',
            data
        });

    }
)