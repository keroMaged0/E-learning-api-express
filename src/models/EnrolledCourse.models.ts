// import mongoose, { Schema } from "mongoose";
// import { ICommonModel, MODELS } from "../types/modelNames";

// export interface IEnrolledCourse extends ICommonModel {
//     userId: mongoose.Types.ObjectId;
//     courseId: mongoose.Types.ObjectId;
//     paymentId: mongoose.Types.ObjectId;
// }

// export const EnrolledCourseSchema = new Schema<IEnrolledCourse>(
//     {
//         userId: {
//             type: Schema.Types.ObjectId,
//             ref: MODELS.users,
//             required: true
//         },
//         courseId: {
//             type: Schema.Types.ObjectId,
//             ref: MODELS.course,
//             required: true
//         },
//         paymentId: {
//             type: Schema.Types.ObjectId,
//             ref: MODELS.payment,
//             required: true
//         }
//     }
// )

// export const EnrolledCourse = mongoose.model<IEnrolledCourse>(MODELS.enrolledCourse, EnrolledCourseSchema)