import multer from 'multer';

import { uploadOptions } from '../types/uploadOptions';


/*************** upload disk storage ***************/
export const uploadDiskStorage = (options?: uploadOptions) => {
    const storage = multer.diskStorage({
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
            cb(null, file.fieldname + '-' + uniqueSuffix)
        }
    })

    const limits = {
        fileSize: options?.maxSize ? options.maxSize :300 * 1024 * 1024
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

/*************** upload memory storage ***************/

export const uploadMemoryStorage = (options?: uploadOptions) => {
    const limits = {
        fileSize: options?.maxSize ? options.maxSize : 200 * 1024 * 1024 // الحد الافتراضي 100 ميجابايت
    };

    const fileFilter = (req, file, cb) => {
        const allowedExtensions = options?.fileType ? options.fileType : ['mp4', 'mov'];
        if (allowedExtensions.includes(file.mimetype.split('/')[1])) {
            return cb(null, true);
        }
        cb(new Error('صيغة الفيديو غير مدعومة!'), false);
    };

    const storage = multer.memoryStorage(); // تخزين الملفات في الذاكرة مؤقتاً قبل الرفع إلى Cloudinary
    return multer({ storage, fileFilter, limits }); // تضمين limits في إعدادات multer
};








