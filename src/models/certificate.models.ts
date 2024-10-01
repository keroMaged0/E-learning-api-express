import mongoose, { Schema } from "mongoose";
import { ICommonModel, MODELS } from "../types/modelNames";
import { IMediaURL } from "../types/imageCover";

export interface ICertificate extends ICommonModel {
    title: string;
    userId: mongoose.Schema.Types.ObjectId;
    courseId: mongoose.Schema.Types.ObjectId;
    pdfUrl: IMediaURL;
}

const certificateSchema = new Schema<ICertificate>({
    title: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: MODELS.users
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: MODELS.course
    },
    pdfUrl: {
        secure_url: {
            type: String,
            default: "",
        },
        public_id: {
            type: String,
            default: "",
        }
    }
});

export const Certificate = mongoose.model<ICertificate>(MODELS.certificate, certificateSchema);
