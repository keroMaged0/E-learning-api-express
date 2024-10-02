import mongoose, { Schema } from "mongoose";
import { ICommonModel, MODELS } from "../types/modelNames";


export interface IEnrolled extends ICommonModel {
    userId: mongoose.Types.ObjectId;
    courseId: mongoose.Types.ObjectId;
    paymentId: mongoose.Types.ObjectId;
}

export const enrolledSchema = new Schema<IEnrolled>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: MODELS.users,
        },
        courseId: {
            type: Schema.Types.ObjectId,
            ref: MODELS.course,
        },
        paymentId: {
            type: Schema.Types.ObjectId,
            ref: MODELS.payment,
        }
    },
    {
        timestamps: true,
        collection: MODELS.enrolled
    }
)


export const Enrolled = mongoose.model<IEnrolled>(MODELS.enrolled, enrolledSchema)