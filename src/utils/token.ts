import { sign, verify } from 'jsonwebtoken';
import { env } from '../config/env';


/*************** generate access Token ***************/
export const generateAccessToken = () => sign({}, env.jwt.accessTokenSecret, { expiresIn: '1h' });


/*************** generate refreshToken ***************/
export const generateRefreshToken = () => sign({}, env.jwt.refreshTokenSecret, { expiresIn: '30d' });


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