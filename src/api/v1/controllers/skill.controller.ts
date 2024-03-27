import { Request, NextFunction, Response } from 'express';
import { skills } from '../utils';

export const GetAllSkills = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        res.status(200).json({success: true, message: 'Lấy list skills thành công', result: skills});
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null;
        }
        next(err);
    };
};