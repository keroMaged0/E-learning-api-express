
import { RequestHandler } from "express";
import { SuccessResponse } from "../../types/response";
import { catchError } from "../../middlewares/errorHandling.middleware";
import { Users } from "../../models/user.models";
import { SystemRoles } from "../../types/roles";

export const userAnalysisHandler: RequestHandler<
    unknown,
    SuccessResponse
> = catchError(
    async (req, res, next) => {
        const totalUsers = await Users.find().countDocuments();
        const totalStudent = await Users.find({ role: SystemRoles.student }).countDocuments();
        const totalTeacher = await   Users.find({ role: SystemRoles.teacher }).countDocuments();
        const verifiedUsers = await Users.find({ isVerified: true }).countDocuments();
        const genderStudent = await Users.find({ role: SystemRoles.student, gender: 'male' }).countDocuments();
        const genderTeacher = await Users.find({ role: SystemRoles.teacher, gender: 'male' }).countDocuments();
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
            message: 'data retreived',
            data: {
                totalStudent,
                totalTeacher,
                genderStudent: { male: genderStudent, female: totalStudent - genderStudent },
                genderTeacher: { male: genderTeacher, female: totalTeacher - genderTeacher },
                bornAt,
                verifiedUsers: {
                    verified: verifiedUsers,
                    notVerified: totalUsers - verifiedUsers,
                },
            },
        });
    }
)

