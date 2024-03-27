import { NextFunction, Request, Response } from 'express';

export const isAuth = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.get('Authorization') as string;
    if (!authHeader) {
        const error: Error & { statusCode?: number, result?: any } = new Error('Not authenticated');
        error.statusCode = 401;
        error.result = null;
        throw error;
    }
    next();
}
