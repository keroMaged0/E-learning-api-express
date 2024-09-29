// models/Review.ts

import mongoose, { Schema } from 'mongoose';
import { ICommonModel, MODELS } from '../types/modelNames';

interface IReview extends ICommonModel {
    entityType: MODELS.course | MODELS.video;
    entityId: string;
    userId: string;
    rating: number;
    comment: string;
}

const ReviewSchema: Schema = new Schema({
    entityType: {
        type: String,
        enum: [MODELS.course, MODELS.video],
        required: true
    },
    entityId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: MODELS.users,
        required: true
    },
    rating: {
        type: Number,
        min: [1, ' rating must be between 1 and 5'],
        max: [5, 'rating must be between 1 and 5'],
    },
    comment: {
        type: String,
        required: true
    },
}, { timestamps: true });

export const Reviews = mongoose.model<IReview>(MODELS.review, ReviewSchema);

