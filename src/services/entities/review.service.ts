import { NotFoundError } from "../../errors/notFoundError";
import { Reviews } from "../../models/review.models";

/*************** Find a review by query. ***************/
const findReview = async (query: any, next: Function) => {
    const review = await Reviews.findOne(query);
    if (!review) {
        return next(new NotFoundError('review not found'));
    }
    return review;
};

/*************** Find a review by ID. ***************/
const findReviewById = async (reviewId: string, next: Function) => {
    const review = await Reviews.findById(reviewId);
    if (!review) {
        return next(new NotFoundError('review not found'));
    }
    return review;
};

export {
    findReview,
    findReviewById,
}