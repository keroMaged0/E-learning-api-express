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
            type: mongoose.Types.ObjectId,
            ref: MODELS.users,
            required: true
        },
        courseId: {
            type: mongoose.Types.ObjectId,
            ref: MODELS.course,
            required: true
        },
        paymentId: {
            type: mongoose.Types.ObjectId,
            ref: MODELS.payment,
            required: true
        }
    },
    {
        timestamps: true,
        collection: MODELS.enrolledCourse
    }
)

export const EnrolledCourse = mongoose.model<IEnrolledCourse>(MODELS.enrolledCourse, EnrolledCourseSchema)