import { Types } from "mongoose";


export enum MODELS {
    enrolledCourse = 'enrolledCourse',
    chatMessage = 'chatMessage',
    certificate = 'certificate',
    question = 'question',
    chatRoom = 'chatRoom',
    payment = 'payment',
    review = 'review',
    course = 'course',
    lesson = 'lesson',
    video = 'video',
    users = 'users',
    quiz = 'quiz',
}


export interface ICommonModel<T = unknown> {
    _id: Types.ObjectId | T;
    id: string;
    createdAt: string;
    updatedAt: string;
}