import mongoose, { Schema } from "mongoose";
import { ICommonModel, MODELS } from "../types/modelNames";

export interface IVideo extends ICommonModel {
    title: string;
    duration: String;
    instructorId: Schema.Types.ObjectId;
    url: {
        secure_url: String,
        public_id: String
    };
    folderId: string;
    lessonId: Schema.Types.ObjectId;
    views: number;
}

export const videoSchema = new Schema<IVideo>(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        duration: {
            type: String,
        },
        url: {
            secure_url: String,
            public_id: String
        },
        folderId: String,
        lessonId: {
            type: Schema.ObjectId,
            ref: MODELS.lesson
        },
        instructorId: {
            type: mongoose.Types.ObjectId,
            ref: MODELS.users,
        },
    },
    {

    })
    .index({ title: "text" })


export const Videos = mongoose.model<IVideo>(MODELS.video, videoSchema)