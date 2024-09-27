import { Types } from "mongoose";


export enum MODELS {
    users = 'users',
    course = 'course',
    lesson = 'lesson',
    video = 'video',
    review = 'review',
    payment = 'payment',
    enrolledCourse = 'enrolledCourse',
}


export interface ICommonModel<T = unknown> {
    _id: Types.ObjectId | T;
    id: string;
    createdAt: string;
    updatedAt: string;
}