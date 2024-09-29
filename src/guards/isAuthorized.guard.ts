import { RequestHandler } from "express";

import { UnauthorizedError } from "../errors/UnauthorizedError";
import { SystemRoles } from "../types/roles";

export const isAuthorized = (...roles: SystemRoles[]) => <RequestHandler>(
    async (req, res, next) => {
        const userRole = req.loggedUser.role;
        if (!userRole || !roles.includes(req.loggedUser.role))
            return next(new UnauthorizedError(undefined));
        next();
    }
)