import { RequestHandler } from "express";
import { SystemRoles } from "../types/roles";
import { UnauthorizedError } from "../errors/UnauthorizedError";

export const isauthorized = (...roles: SystemRoles[]) => <RequestHandler>(
    async (req, res, next) => {
        const userRole = req.loggedUser.role;
        if (!userRole || !roles.includes(req.loggedUser.role))
            return next(new UnauthorizedError(undefined));
        next();
    }
)