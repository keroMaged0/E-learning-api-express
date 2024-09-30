import { ObjectId, Schema, model } from 'mongoose';
import { ICommonModel, MODELS } from '../types/modelNames';

interface IQuestion extends ICommonModel {
    quizId: ObjectId;
    questionText: string;
    options: string[];
    correctAnswer: string;
}

const QuestionSchema = new Schema<IQuestion>({
    quizId: {
        type: Schema.Types.ObjectId,
        ref: MODELS.quiz,
        required: true
    },
    questionText: {
        type: String,
        required: true
    },
    options: [
        {
            type: String,
            required: true
        }
    ],
    correctAnswer: {
        type: String,
        required: true
    }
});

export const Question = model<IQuestion>(MODELS.question, QuestionSchema);
