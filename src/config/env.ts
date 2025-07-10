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
        secretKey: process.env.STRIPE_SECRET_KEY,
        publicKey: process.env.STRIPE_PUBLISH_KEY,
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET
    },
    paymob: {
        api_key: process.env.PAYMOB_API_KEY,
        secret_Key: process.env.PAYMOB_SECRET_KEY,
        Public_Key: process.env.PAYMOB_PUBLIC_KEY,
        HMAC: process.env.PAYMOB_HMAC_SECRET,
        baseUrl: process.env.PAYMOB_BASE_URL

    }
}


const requiredEnvVars = [
    { key: 'MONGO_URI', value: env.mongoDb.url },
    { key: 'BCRYPT_SALT', value: env.bcrypt.salt, validate: (val: number) => Number.isInteger(val) },
    { key: 'JWT_ACCESS_SECRET', value: env.jwt.accessTokenSecret },
    { key: 'JWT_REFRESH_SECRET', value: env.jwt.refreshTokenSecret },
    { key: 'MAIL_PORT', value: env.mail.port, validate: (val: number) => Number.isInteger(val) },
    { key: 'MAIL_DRIVER', value: env.mail.driver },
    { key: 'MAIL_USER', value: env.mail.user },
    { key: 'MAIL_PASS', value: env.mail.pass },
    { key: 'API_URL', value: env.apiUrl },
    { key: 'CLOUDINARY_API_KEY', value: env.cloudinary.cloudinaryApiKey },
    { key: 'CLOUDINARY_CLOUD_NAME', value: env.cloudinary.cloudinaryName },
    { key: 'CLOUDINARY_API_SECRET', value: env.cloudinary.cloudinaryApiSecret },

    // Uncomment the following lines if you are using Firebase
];

export const checkEnvVariables = () => {
    requiredEnvVars.forEach(({ key, value, validate }) => {
        if (!value) {
            throw new Error(`env:${key} must be defined`);
        }
        if (validate && !validate(value)) {
            throw new Error(`env:${key} must be an integer`);
        }
    });
};
