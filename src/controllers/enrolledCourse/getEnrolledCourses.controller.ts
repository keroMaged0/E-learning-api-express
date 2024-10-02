import { RequestHandler } from "express";

import { catchError } from "../../middlewares/errorHandling.middleware";
import { SuccessResponse } from "../../types/response";
import { Enrolled } from "../../models/enrolled.model";


/**
 * Handler function to retrieve all courses enrolled by the logged-in user.
 * This function fetches the user ID from the request object and queries the 
 * EnrolledCourse model to find all courses associated with that user.
 * It utilizes the populate method to include detailed information about each
 * course, such as the lessons' titles, durations, video IDs, and image covers.
 * 
 * @param {Request} req - The request object containing the logged-in user's information.
 * @param {Response} res - The response object used to send a response back to the client.
 * @param {NextFunction} next - The next middleware function in the stack.
 * @returns {Promise<void>} - A promise that resolves to void.
 * @throws {NotFoundError} - Throws an error if no courses are found for the user.
 */
export const getEnrolledCoursesHandler: RequestHandler<
    unknown,
    SuccessResponse
> = catchError(
    async (req, res, next) => {
        const { _id } = req.loggedUser;

        const enrolled = await Enrolled.find({ userId: _id })
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
            .exec();;
        if (!enrolled || enrolled.length === 0) return res.status(200).json({ message: "No courses enrolled" })

        res.status(200).json({
            status: true,
            message: 'data retrieved successfully',
            data: enrolled
        });

    }
)