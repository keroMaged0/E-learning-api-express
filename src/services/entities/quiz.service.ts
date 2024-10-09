import { NotFoundError } from "../../errors/notFoundError";
import { Quiz } from "../../models/quiz.models";

/*************** Find a quiz by query. ***************/
const findQuiz = async (query: any, next: Function) => {
    const quiz = await Quiz.findOne(query);
    if (!quiz) {
        return next(new NotFoundError('quiz not found'));
    }
    return quiz;
};

/*************** Find a quiz by ID. ***************/
const findQuizById = async (quizId: string, next: Function) => {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
        return next(new NotFoundError('quiz not found'));
    }
    return quiz;
};

export {
    findQuiz,
    findQuizById,
}