import { sign, verify } from 'jsonwebtoken';
import { env } from '../config/env';
import { setCache } from '../services/redisCache.service';
import { logger } from '../utils/logger';


/*************** generate access Token ***************/
export const generateAccessToken = () => sign({}, env.jwt.accessTokenSecret, { expiresIn: '1h' });


/*************** generate refreshToken ***************/
export const generateRefreshToken = () => sign({}, env.jwt.refreshTokenSecret, { expiresIn: '30d' });

/*************** generate temporary token ***************/
export const generateTempToken = async (userId: string): Promise<{ token: string; expiresInSeconds: number }> => {
    const tempToken = crypto.randomUUID();
    const cacheKey = `${env.redis.cacheTempKey}${tempToken}`;
    const expiresInSeconds = env.redis.cacheTempExpire;

    try {
        await setCache(cacheKey, userId, expiresInSeconds);
        return { token: tempToken, expiresInSeconds };
    } catch (error) {
        logger.error('Failed to store temporary token in cache:', error)
        throw new Error('Failed to generate temporary token');
    }

}

/*************** check is valid access token ***************/
export const isValidAccessToken = (token: string) => {
    try {
        verify(token, env.jwt.accessTokenSecret);
        return true;
    } catch (error) {
        return false;
    }
};


/*************** check is valid refresh token ***************/
export const isValidRefreshToken = (token: string) => {
    try {
        verify(token, env.jwt.refreshTokenSecret);
        return true;
    } catch (error) {
        return false;
    }
};
