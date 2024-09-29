import mongoose, { Schema } from "mongoose";

import { ICommonModel, MODELS } from "../types/modelNames";
import { IImageCover } from "../types/imageCover";

export interface ILesson extends ICommonModel {
    title: string;
    content: string;
    duration: string;
    videoId: mongoose.Schema.Types.ObjectId[];
    courseId: mongoose.Schema.Types.ObjectId;
    imageCover: IImageCover;
    folderId: string;
    instructorId: mongoose.Schema.Types.ObjectId;
    resourses: string[];
}

export const lessonsSchema = new Schema<ILesson>(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        content: {
            type: String,
            trim: true
        },
        duration: {
            type: String,
            default: null
        },
        videoId: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: MODELS.video,
            default: null
        }],
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: MODELS.course,
            required: true
        },
        instructorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: MODELS.users,
            required: true
        },
        imageCover: {
            secure_url: String,
            public_id: String
        },
        folderId: {
            type: String,
            trim: true
        },
        resourses: [{
            type: String,
            trim: true
        }]
    },
    {
        timestamps: true,
        collection: MODELS.lesson
    }
).index({ title: 'text' })


export const Lessons = mongoose.model<ILesson>(MODELS.lesson, lessonsSchema)
