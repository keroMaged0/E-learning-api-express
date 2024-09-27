import mongoose, {  ObjectId, Schema } from "mongoose";
import { ICommonModel, MODELS } from "../types/modelNames";
import { IImageCover } from "../types/imageCover";

export interface ICourse extends ICommonModel<ICourse> {
    description: string;
    title: string;
    duration: string;
    folderId: number;
    price: number;
    subscription: boolean;
    instructorId: ObjectId;
    lessonsId: ObjectId[]; // array of ObjectId for lessons
    ratingId: ObjectId[];
    imageCover: IImageCover;
    verificationCode: {
        code: string | null;
        expireAt: Date | null;
        reason: string | null;
        tempEmail: string | null;
    };
}

export const courseSchema = new Schema<ICourse>(
    {
        description: {
            type: String,
            required: true
        },
        title: {
            type: String,
            required: true
        },
        duration: {
            type: String,
            default: null,
        },
        folderId: {
            type: Number,
        },
        price: {
            type: Number,
            required: true
        },
        subscription: {
            type: Boolean,
            default: false
        },
        instructorId: {
            type: mongoose.Types.ObjectId,
            ref: MODELS.users
        },
        lessonsId: [{
            type: Schema.Types.ObjectId,
            ref: MODELS.lesson // reference to lesson model
        }],
        ratingId: [{
            type: Schema.Types.ObjectId,
            ref: MODELS.review
        }],
        imageCover: {
            secure_url: String,
            public_id: String
        },
        verificationCode: {
            code: { type: String, default: null },
            expireAt: { type: Date, default: null },
            reason: { type: String, default: null },
            tempEmail: { type: String, default: null },
        },
    },
    {
        timestamps: true,
        collection: MODELS.course
    }
).index({ title: 'text' })


export const Courses = mongoose.model<ICourse>(MODELS.course, courseSchema)

