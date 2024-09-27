// models/Review.ts

import mongoose, { Schema } from 'mongoose';
import { ICommonModel } from '../types/modelNames';

interface IReview extends ICommonModel {
    entityType: 'course' | 'lesson'; // نوع الكيان
    entityId: string; // ID للدورة أو الدرس
    userId: string;
    rating: number; // تقييم من 1 إلى 5
    comment: string;
}

const ReviewSchema: Schema = new Schema({
    entityType: { type: String, enum: ['course', 'lesson'], required: true },
    entityId: { type: Schema.Types.ObjectId, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
}, { timestamps: true });

const Reviews = mongoose.model<IReview>('Review', ReviewSchema);

export default Reviews;