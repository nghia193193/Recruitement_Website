import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { secretKey, verifyToken, transporter } from '../utils';
import { validationResult } from 'express-validator';
import { User } from '../models/user';
import { JobPosition } from '../models/jobPosition';
import { Job } from '../models/job';
import { JobType } from '../models/jobType';
import { JobLocation } from '../models/jobLocation';
import { Skill } from '../models/skill';

export const GetAllJobs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.get('Authorization') as string;
    const accessToken = authHeader.split(' ')[1];

    try {
        const decodedToken: any = await verifyToken(accessToken);
        const recruiter = await User.findOne({email: decodedToken.email}).populate('roleId');
        if (!recruiter) {
            const error: Error & {statusCode?: number} = new Error('Không tìm thấy user');
            error.statusCode = 409;
            throw error;
        };
        
        if (recruiter.get('roleId.roleName') !== 'RECRUITER') {
            const error: Error & {statusCode?: number} = new Error('UnAuthorized');
            error.statusCode = 401;
            throw error;
        };
        const page: number = req.query.page ? +req.query.page : 1;
        const limit: number = req.query.limit ? +req.query.limit : 10;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error: Error & {statusCode?: number} = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            throw error;
        }
        const query: any = {};
        if (req.query['name']) {
            query['name'] = req.query['name'];
        };
        if (req.query['type']) {
            const jobType = await JobType.findOne({name: req.query['type']});
            query['typeId'] = jobType?._id;
        };
        if (req.query['position']) {
            const jobPos = await JobPosition.findOne({name: req.query['position']});
            query['positionId'] = jobPos?._id;
        };
        if (req.query['location']) {
            const jobLoc = await JobLocation.findOne({name: req.query['location']});
            query['locationId'] = jobLoc?._id;
        };
        const jobLength = await Job.find(query).countDocuments();
        if (jobLength === 0) {
            const error: Error & { statusCode?: any, success?: any, result?: any } = new Error('Không tìm thấy job');
            error.statusCode = 200;
            error.success = true;
            error.result = {
                content: []
            };
            throw error;
        };

        const jobs = await Job.find(query).populate('positionId locationId typeId skills.skillId')
            .skip((page - 1) * limit)
            .limit(limit);
        
        const listjobs = jobs.map(job => {
            const { _id, skills, positionId, locationId, typeId, ...rest} = job;
            delete (rest as any)._doc._id;
            delete (rest as any)._doc.skills;
            delete (rest as any)._doc.positionId;
            delete (rest as any)._doc.locationId;
            delete (rest as any)._doc.typeId;
            const listSkills = skills.map(skill => {
                return (skill as any).skillId.name
            });
            return {
                jobId: _id.toString(),
                position: (positionId as any).name,
                location: (locationId as any).name,
                jobType: (typeId as any).name,
                ...(rest as any)._doc,
                skills: listSkills
            };
        });

        res.status(200).json({success: true, message: 'Successfully', statusCode: 200, result: {
            pageNumber: page,
            totalPages: Math.ceil(jobLength/limit),
            limit: limit,
            totalElements: jobLength,
            content: listjobs
        }});

    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
        }
        next(err);
    }
};

export const CreateJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.get('Authorization') as string;
    const accessToken = authHeader.split(' ')[1];
    const { name, jobType, quantity, benefit, salaryRange, 
        requirement, location, description, deadline, position, skillRequired } = req.body;
    const errors = validationResult(req);
    try {
        const decodedToken: any = await verifyToken(accessToken);
        const recruiter = await User.findOne({email: decodedToken.email}).populate('roleId');
        if (!recruiter) {
            const error: Error & {statusCode?: number} = new Error('Không tìm thấy user');
            error.statusCode = 409;
            throw error;
        };
        if (recruiter.get('roleId.roleName') !== 'RECRUITER') {
            const error: Error & {statusCode?: number} = new Error('UnAuthorized');
            error.statusCode = 401;
            throw error;
        };
        if(!errors.isEmpty()) {
            const error: Error & { statusCode?: any, result?: any } = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            throw error;
        }
        const pos = await JobPosition.findOne({name: position});
        const type = await JobType.findOne({name: jobType}); 
        const loc = await JobLocation.findOne({name: location});
        
        let listSkill: string[] = [];
        (skillRequired as string[]).forEach(sk => {
            return Skill.findOne({name: sk})
                .then(s => {
                    listSkill.push((s as any)._id.toString())
                })
        });
        const job = new Job({
            name: name,
            positionId: (pos as any)._id.toString(),
            typeId: (type as any)._id.toString(),
            authorId: recruiter._id.toString(),
            quantity: +quantity,
            benefit: +benefit,
            salaryRange: salaryRange,
            requirement: requirement,
            locationId: (loc as any)._id.toString(),
            description: description,
            isActive: true,
            deadline: deadline,
            skills: listSkill
        });
        console.log(job);
        await job.save();
        res.status(200).json({success: true, message: "Tạo job thành công"})
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
        }
        next(err);
    }
};

export const DeleteJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {

};