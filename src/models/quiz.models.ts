import { ObjectId, Schema, model } from 'mongoose';
import { ICommonModel, MODELS } from '../types/modelNames';

interface IQuiz extends ICommonModel {
    title: string;
    description?: string;
    courseId: ObjectId;
    questions: ObjectId[];
}

const QuizSchema = new Schema<IQuiz>({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    courseId: {
        type: Schema.Types.ObjectId,
        ref: MODELS.course,
        required: true
    },
    questions: [
        {
            type: Schema.Types.ObjectId,
            ref: MODELS.question,
        }
    ],
});

export const Quiz = model<IQuiz>('Quiz', QuizSchema);
