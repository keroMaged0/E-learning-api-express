import { RequestHandler } from "express";

import { catchError } from "../../middlewares/errorHandling.middleware";
import { SuccessResponse } from "../../types/response";
import { Users } from "../../models/user.models";
import { SystemRoles } from "../../types/roles";


/**
 * Handles the analysis of user data, including counts of different user roles and verification status.
 * It retrieves the total number of students, teachers, verified users, and aggregates birth year data.
 *
 * @param {Request} req - Express request object containing user request data.
 * @param {Response} res - Express response object to send the success response.
 * @param {Function} next - Middleware function to handle errors.
 * @returns {Promise<void>} - Sends a JSON response with user analysis data or an error if any occurs.
 */
export const userAnalysisHandler: RequestHandler<
    unknown,
    SuccessResponse
> = catchError(
    async (req, res, next) => {
        const totalStudent = await Users.find({ role: SystemRoles.student }).countDocuments();
        const totalTeacher = await Users.find({ role: SystemRoles.teacher }).countDocuments();
        const verifiedUsers = await Users.find({ isVerified: true }).countDocuments();
        const totalUsers = await Users.find().countDocuments();

        // Aggregate data to count users born in each year
        const bornAt = await Users.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: '$bornAt' },
                    },
                    count: { $sum: 1 },
                }
            },
            {
                $project: {
                    _id: 0,
                    year: '$_id.year',
                    count: 1,
                },
            },
        ])

        res.status(200).json({
            status: true,
            message: 'Data retrieved successfully',
            data: {
                totalStudent,
                totalTeacher,
                bornAt,
                verifiedUsers: {
                    verified: verifiedUsers,
                    notVerified: totalUsers - verifiedUsers,
                },
            },
        });
    }
)

