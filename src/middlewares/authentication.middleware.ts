import { RequestHandler } from "express";
import { Types } from "mongoose";

import { NotAllowedError } from "../errors/notAllowedError";
import { isValidAccessToken } from "../utils/token";
import { Users } from "../models/user.models";


/******************** Authentication middleware ********************/
export const authenticationMiddleware: RequestHandler = async (req, res, next) => {
    // destruct token from headers
    const token = req.headers.authorization
    if (!token) return next();

    // check if token is valid
    const validToken = isValidAccessToken(token);
    if (!validToken) return next(new NotAllowedError('expired token or invalid'));

    // find user by token
    const user = await Users.findOne({ accessToken: token });
    if (!user) return next();

    // token payload
    const payload = {
        _id: user._id as Types.ObjectId,
        role: user.role,
        isVerified: user.isVerified,
    };

    req.loggedUser = payload;

    next();
}
