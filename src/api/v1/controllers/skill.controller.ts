import { Request, NextFunction, Response } from 'express';
import { Skill } from '../models/skill';

export const GetAllSkills = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const skills = await Skill.find();
        const listSkills = skills.map(skill => {
            return {
                skillId: skill._id,
                name: skill.name
            }
        });
        res.status(200).json({success: true, message: 'Lấy list skills thành công', result: listSkills});
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
        }
        next(err);
    };
};