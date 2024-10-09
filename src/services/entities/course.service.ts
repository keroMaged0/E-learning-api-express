import { NotFoundError } from "../../errors/notFoundError";
import { Courses } from "../../models/course.models";

/*************** Find a course by query. ***************/
const findCourse = async (query: any, next: Function) => {
    const course = await Courses.findOne(query);
    if (!course) {
        return next(new NotFoundError('course not found'));
    }
    return course;
};

/*************** Find a course by ID. ***************/
const findCourseById = async (courseId: string, next: Function) => {
    const course = await Courses.findById(courseId);
    if (!course) {
        return next(new NotFoundError('course not found'));
    }
    return course;
};

export {
    findCourse,
    findCourseById,
}