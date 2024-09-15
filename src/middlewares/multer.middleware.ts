
import multer from 'multer';
import { uploadOptions } from '../types/uploadOptions';


/*************** upload memory storage ***************/
export const uploadMemoryStorage = (options?: uploadOptions) => {

    const storage = multer.memoryStorage()

    const limits = {
        fileSize: options?.maxSize ? options.maxSize : 3 * 1024 * 1024
    }

    const fileFilter = (req, file, cb) => {
        const allowedExtensions = options?.fileType ? options.fileType : ['jpg', 'png', 'jpeg'];
        if (allowedExtensions.includes(file.mimetype.split('/')[1])) {
            return cb(null, true)
        }

        cb(new Error('Image format is not allowed!'), false)
    }

    const upload = multer({ fileFilter, limits, storage })

    return upload
}







