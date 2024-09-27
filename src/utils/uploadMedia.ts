import { logger } from "../config/logger";
import { formatDuration } from "../controllers/videos";
import { ConflictError } from "../errors/conflictError";
import { NotFoundError } from "../errors/notFoundError";
import { cloudinaryConnection } from "../services/cloudinary";

/*************** upload image ***************/
export const uploadImageToCloudinary = async (file: Express.Multer.File, pathUrl: string, newPublicId?: string) => {
    return await cloudinaryConnection().uploader.upload(file.path, { folder: pathUrl, public_id: newPublicId });
};

/*************** upload video ***************/
export const uploadVideoToCloudinary = async (file: Express.Multer.File, pathUrl: string, newPublicId?: string) => {
    try {
        const result = await new Promise((resolve, reject) => {
            cloudinaryConnection().uploader.upload_large(file.path,
                { folder: pathUrl, public_id: newPublicId, resource_type: 'video', timeout: 120000 },
                (err, result) => {
                    if (err) {
                        console.error('Error uploading video:', err);
                        reject(err);
                    }

                    resolve({
                        secure_url: result?.secure_url,
                        public_id: result?.public_id,
                        duration: result?.duration,
                    });
                }
            )

        })

        return result;

    } catch (error) {
        console.error('Error uploading video:', error);
        throw error;

    }
}

/*************** delete media ***************/
export const DeleteMedia = async (pathUrl: string) => {
    try {
        const videosResources = await cloudinaryConnection().api.resources({
            type: 'upload',
            prefix: pathUrl,
            resource_type: 'video'
        });

        const videoPublicIds = videosResources.resources.map(resource => resource.public_id);

        if (videoPublicIds.length > 0) {
            for (const video of videoPublicIds) {
                await cloudinaryConnection().api.delete_resources_by_prefix(video, { resource_type: 'video' });
            }
        }

        // Delete images
        const imageResources = await cloudinaryConnection().api.resources({
            type: 'upload',
            prefix: pathUrl,
            resource_type: 'image'
        });

        const imagePublicIds = imageResources.resources.map(resource => resource.public_id);

        if (imagePublicIds.length > 0) {
            await cloudinaryConnection().api.delete_resources(imagePublicIds);
        }

        await cloudinaryConnection().api.delete_folder(pathUrl);
    } catch (error: any) {
        logger.error(error.message)
        throw new Error('internal server error');
    }
}


/*************** update image ***************/
export const updateImage = async (req, query, oldPublicId, next) => {
    if (!req.file) return next(new NotFoundError('Cover image is required'));

    if (query.imageCover.public_id !== oldPublicId) {
        return next(new ConflictError(`Old public ID does not match the ${query} cover image public ID`));
    }

    const newPublicId = oldPublicId.split(`${query.folderId}/imageCover/`)[1];
    const pathUrl = oldPublicId.split(`${newPublicId}`)[0]

    const { secure_url } = await uploadImageToCloudinary(req.file, pathUrl, newPublicId);
    query.imageCover.secure_url = secure_url;
}

/*************** update video ***************/

export const updateVideo = async (req, query, oldPublicId, next) => {
    if (!req.file) return next(new NotFoundError('Video file is required'));

    if (query.url.public_id !== oldPublicId) {
        return next(new ConflictError(`Old public ID does not match the ${query} video public ID`));
    }

    const newPublicId = oldPublicId.split(`${query.folderId}/`)[1];
    const pathUrl = oldPublicId.split(`${newPublicId}`)[0]

    const { secure_url, duration }: any = await uploadVideoToCloudinary(req.file, pathUrl, newPublicId);

    const format = await formatDuration(duration)
    query.video.duration = format; // Update video duration
    query.video.url.secure_url = secure_url; // Update video URL
}