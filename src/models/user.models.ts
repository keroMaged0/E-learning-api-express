import mongoose, { Schema } from "mongoose";

import { ICommonModel, MODELS } from "../types/modelNames";
import { SystemRoles } from "../types/roles";
import { IImageCover } from "../types/imageCover";

export interface IUser extends ICommonModel<IUser> {
    id: string;
    name: string;
    email: string;
    password: string;
    verificationCode: {
        code: string | null;
        expireAt: Date | null;
        reason: string | null;
        tempEmail: string | null;
    };
    refreshToken: string;
    accessToken: string | null;
    phoneNumber: string;
    folderId: number;
    profileImage: IImageCover;
    isVerified: boolean;
    bornAt: Date;
    role: SystemRoles;
    token: string | null;
    gender: 'male' | 'female';
    uid: string;
    '2faSecret': string | null;
    '2faEnabled': boolean | false;
}


export const userSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true,
        },
        verificationCode: {
            code: { type: String, default: null },
            expireAt: { type: Date, default: null },
            reason: { type: String, default: null },
            tempEmail: { type: String, default: null },
        },
        accessToken: {
            type: String,
            default: null
        },
        refreshToken: {
            type: String,
            default: null
        },
        phoneNumber: {
            type: String,
            required: true
        },
        folderId: {
            type: Number,
            default: null
        },
        profileImage: {
            secure_url: { type: String, default: null },
            public_id: { type: String, default: null }
        },
        isVerified: {
            type: Boolean,
            default: false
        },
        role: {
            type: String,
            enum: Object.values(SystemRoles),
            default: SystemRoles.student
        },
        bornAt: Date,
        token: String,
        gender: {
            type: String,
            enum: ['male', 'female']
        },
        '2faSecret': {
            type: String,
            default: null
        },
        '2faEnabled': {
            type: Boolean,
            default: false
        },
    },
    {
        timestamps: true, collection: MODELS.users
    })
    .index({ createdAt: 1, updatedAt: -1 })
    .index({ name: 'text', email: 'text' })


export const Users = mongoose.model<IUser>(MODELS.users, userSchema)

