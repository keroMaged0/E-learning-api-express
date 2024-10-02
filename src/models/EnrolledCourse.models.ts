import mongoose, { ObjectId, Schema } from "mongoose";
import { ICommonModel, MODELS } from "../types/modelNames";

export interface IEnrolledCourse extends ICommonModel {
    userId: ObjectId;
    courseId: ObjectId;
    paymentId: ObjectId;
}

export const EnrolledCourseSchema = new Schema<IEnrolledCourse>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: MODELS.users,
        },
        // courseId: {
        //     type: mongoose.Types.ObjectId,
        //     ref: MODELS.course,
        // },
        // paymentId: {
        //     type: mongoose.Types.ObjectId,
        //     ref: MODELS.payment,
        // }
    },
    {
        timestamps: true,
        collection: MODELS.enrolledCourse
    }
)

export const Enrolled = mongoose.model<IEnrolledCourse>(MODELS.enrolledCourse, EnrolledCourseSchema)