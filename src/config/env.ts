import { config } from 'dotenv';
config();

export const env = {
    port: +(process.env.DEV_PORT || 3100) as number,
    environment: process.env.NODE_ENV?.trim() || 'development',
    apiUrl: process.env.API_URL!,
    frontUrl: process.env.FRONT_URL?.split(',').map((el) => el.trim()) as string[] | undefined,
    mongoDb: {
        url: process.env.MONGO_URI!
    },
    bcrypt: {
        salt: +(process.env.BCRYPT_SALT || 1) as number,
        paper: process.env.BCRYPT_PAPER,
    },
    winston: {

        sourceToken: process.env.SOURCE_TOKEN,
        sourceId: process.env.SOURCE_ID
    },
    mail: {
        host: process.env.MAIL_HOST,
        service: process.env.MAIL_SERVICE,
        port: +(process.env.MAIL_PORT || 1) as number,
        driver: process.env.MAIL_DRIVER!,
        user: process.env.MAIL_USER!,
        pass: process.env.MAIL_PASS!,
    },
    jwt: {
        accessTokenSecret: process.env.JWT_ACCESS_SECRET as string,
        refreshTokenSecret: process.env.JWT_REFRESH_SECRET as string,
        accessExpireIn: +(process.env.JWT_ACCESS_EXPIRE_IN || 24 * 60 * 60) as number,
        refreshExpireIn: +(process.env.JWT_REFRESH_EXPIRE_IN || 12 * 30 * 24 * 60 * 60) as number,
    },
    cloudinary: {
        cloudinaryName: process.env.CLOUDINARY_CLOUD_NAME,
        cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
        cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
        baseUrl: process.env.CLOUDINARY_BASE_URL,
    },
    redis: {
        host: process.env.REDIS_HOST,
        port: +(process.env.REDIS_PORT || 6379) as number,
        password: process.env.REDIS_PASSWORD,
        cacheTempKey: process.env.CACHE_TEMPORARY_TOKEN_PREFIX,
        cacheTempExpire: + (process.env.CACHE_TEMPORARY_TOKEN_EXPIRE || 3600) as number
    },
    stripe: {
        client_id: process.env.STRIPE_PUBLISH_KEY,
        client_secret: process.env.STRIPE_SECRET_KEY,
    }
}


export const checkEnvVariables = () => {
    if (!env.mongoDb.url) throw new Error('env:MONGO_URI must be defined');
    if (!env.bcrypt.salt) throw new Error('env:BCRYPT_SALT must be defined');
    if (!Number.isInteger(env.bcrypt.salt)) throw new Error('env:BCRYPT_SALT must be integer');
    if (!env.jwt.accessTokenSecret) throw new Error('env:JWT_ACCESS_TOKEN_SECRET must be defined');
    if (!env.jwt.refreshTokenSecret) throw new Error('env:JWT_REFRESH_TOKEN_SECRET must be defined');
    if (!env.mail.port) throw new Error('env:MAIL_PORT must be defined');
    if (!Number.isInteger(env.mail.port)) throw new Error('env:MAIL_PORT must be integer');
    if (!env.mail.driver) throw new Error('env:MAIL_DRIVER must be defined');
    if (!env.mail.user) throw new Error('env:MAIL_USER must be defined');
    if (!env.mail.pass) throw new Error('env:MAIL_PASS must be defined');
    if (!env.apiUrl) throw new Error('env:API_URL must be defined');
    if (!env.cloudinary.cloudinaryApiKey) throw new Error('env:Cloudinary API key must be defined');
    if (!env.cloudinary.cloudinaryName) throw new Error('env:Cloudinary name must be defined');
    if (!env.cloudinary.cloudinaryApiSecret) throw new Error('env:Cloudinary API secret must be defined');

    // if (!env.firebase.projectId) throw new Error('env:FB_PROJECTID must be defined');
    // if (!env.firebase.clientEmail) throw new Error('env:FB_CLIENTEMAIL must be defined');
    // if (!env.firebase.privateKey) throw new Error('env:FB_PRIVATEKEY must be defined');
    // if (!env.firebase.storageBucket) throw new Error('env:FB_STORAGEBUCKET must be defined');
    // if (!env.firebase.apiKey) throw new Error('env:FB_APIKEY must be defined');
    // if (!env.firebase.authDomain) throw new Error('env:FB_AUTHDOMAIN must be defined');
    // if (!env.firebase.messagingSenderId) throw new Error('env:FB_MESSAGINGSENDERID must be defined');
    // if (!env.firebase.appId) throw new Error('env:FB_APPID must be defined');
    // if (!env.firebase.bucketUrl) throw new Error('env:BUCKET_URL must be defined');
};
