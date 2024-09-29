import mongoose, { Model, Schema } from "mongoose";
import { ICommonModel, MODELS } from "../types/modelNames";

export interface IPayment extends ICommonModel {
    userId: mongoose.Types.ObjectId;
    courseId: mongoose.Types.ObjectId;
    amount: number;
    status: 'successful' | 'failed' | 'pending' | 'cancelled';
    paymentMethod: 'paypal' | 'stripe' | 'paymob';
    transactionId: string;
}

export const paymentSchema = new Schema<IPayment>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: MODELS.users,
        required: true
    },
    courseId: {
        type: Schema.Types.ObjectId,
        ref: MODELS.course,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['successful', 'failed', 'pending', 'cancelled']
    },
    paymentMethod: {
        type: String,
        enum: ['stripe', 'paymob'],
        required: true
    },
    transactionId: {
        type: String,
        default: ''
    },
})

export const Payment = mongoose.model<IPayment>(MODELS.payment, paymentSchema)