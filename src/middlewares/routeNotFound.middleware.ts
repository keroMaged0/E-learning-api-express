import { RequestHandler } from 'express';
import { NotFoundError } from '../errors/notFoundError';


export const routeNotFoundMiddleware: RequestHandler = async (req, res, next) => {
    next(new NotFoundError('Not found route'));
}

