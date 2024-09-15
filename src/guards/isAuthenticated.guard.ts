import { RequestHandler } from "express";
import { UnauthenticatedError } from "../errors/UnauthenticatedError";

export const isAuthenticated: RequestHandler = async (req, res, next) => {    
    if (!req.loggedUser?._id) return next(new UnauthenticatedError(undefined))
    next();
}
