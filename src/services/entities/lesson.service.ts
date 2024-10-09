import { NotFoundError } from "../../errors/notFoundError";
import { Lessons } from "../../models/lesson.models";

/*************** Find a lesson by query. ***************/
const findLesson = async (query: any, next: Function) => {
    const lesson = await Lessons.findOne(query);
    if (!lesson) {
        return next(new NotFoundError('lesson not found'));
    }
    return lesson;
};

/*************** Find a lesson by ID. ***************/
const findLessonById = async (lessonId: string, next: Function) => {
    const lesson = await Lessons.findById(lessonId);
    if (!lesson) {
        return next(new NotFoundError('lesson not found'));
    }
    return lesson;
};

export {
    findLesson,
    findLessonById,
}