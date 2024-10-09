import { NotFoundError } from "../../errors/notFoundError";
import { Videos } from "../../models/video.models";

/*************** Find a video by query. ***************/
const findVideo = async (query: any, next: Function) => {
    const video = await Videos.findOne(query);
    if (!video) {
        return next(new NotFoundError('video not found'));
    }
    return video;
};

/*************** Find a video by ID. ***************/
const findVideoById = async (videoId: string, next: Function) => {
    const video = await Videos.findById(videoId);
    if (!video) {
        return next(new NotFoundError('video not found'));
    }
    return video;
};

export {
    findVideo,
    findVideoById,
}