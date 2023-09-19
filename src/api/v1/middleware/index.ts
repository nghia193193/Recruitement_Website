import { NextFunction, Request, Response } from 'express';

export const isAuth = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.get('Authorization') as string;
    if (!authHeader) {
        const error: Error & {statusCode?: number} = new Error('Not authenticated');
        error.statusCode = 401;
        throw error;
    }
    next();
}