import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env';
import { logger } from '../config/logger';

export const cloudinaryConnection = () => {
    cloudinary.config({
        cloud_name: env.cloudinary.cloudinaryName,
        api_key: env.cloudinary.cloudinaryApiKey,
        api_secret: env.cloudinary.cloudinaryApiSecret
    });
    return cloudinary;
}



