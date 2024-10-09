import { NotFoundError } from "../../errors/notFoundError";
import { Question } from "../../models/question.models";

/*************** Find a question by query. ***************/
const findQuestion = async (query: any, next: Function) => {
    const question = await Question.findOne(query);
    if (!question) {
        return next(new NotFoundError('question not found'));
    }
    return question;
};

/*************** Find a question by ID. ***************/
const findQuestionById = async (questionId: string, next: Function) => {
    const question = await Question.findById(questionId);
    if (!question) {
        return next(new NotFoundError('question not found'));
    }
    return question;
};

export {
    findQuestion,
    findQuestionById,
}