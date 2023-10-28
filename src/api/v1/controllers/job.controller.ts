import { Request, NextFunction, Response } from 'express';
import { Job } from '../models/job';
import { JobPosition } from '../models/jobPosition';
import { validationResult } from 'express-validator';
import { JobLocation } from '../models/jobLocation';
import { JobType } from '../models/jobType';

export const GetJobs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const page: number = req.query.page ? +req.query.page : 1;
    const limit: number = req.query.limit ? +req.query.limit : 10;
    const errors = validationResult(req);
    try {
        if (!errors.isEmpty()) {
            const error: Error & { statusCode?: any, result?: any } = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = {
                content: []
            };
            throw error;
        };
        const query: any = {
            isActive: true
        };
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
            (err as any).result = null
        };
        next(err);
    };
};

export const GetLocation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const jobs = await JobLocation.find();
        let listLocation = jobs.map(job => {
            return job.name;
        });
        listLocation = [...new Set(listLocation)];
        res.status(200).json({success: true, message: 'Lấy list Location thành công', statusCode: 200, result: listLocation});
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null
        };
        next(err);
    };
};

export const GetPosition = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const jobPos = await JobPosition.find();
        let listPosition = jobPos.map(job => {
            return job.name;
        });
        listPosition = [...new Set(listPosition)];
        res.status(200).json({success: true, message: 'Lấy list Position thành công', statusCode: 200, result: listPosition});
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null
        };
        next(err);
    };
};

export const GetType = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const jobs = await JobType.find();
        let listType = jobs.map(job => {
            return job.name;
        });
        listType = [...new Set(listType)];
        res.status(200).json({success: true, message: 'Lấy list Type thành công', statusCode: 200, result: listType});
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null
        };
        next(err);
    };
};

export const GetSingleJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const jobId = req.params.jobId;
    const errors = validationResult(req);
    try {
        if (!errors.isEmpty()) {
            const error: Error & { statusCode?: any, result?: any } = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        };
        const job = await Job.findById(jobId).populate('positionId locationId typeId skills.skillId');
        if (!job) {
            const error: Error & {statusCode?: any, result?: any} = new Error('Không tìm thấy job');
            error.statusCode = 400;
            error.result = null;
            throw error;
        };
        const { _id, skills, positionId, locationId, typeId, ...rest} = job;
        delete (rest as any)._doc._id;
        delete (rest as any)._doc.skills;
        delete (rest as any)._doc.positionId;
        delete (rest as any)._doc.locationId;
        delete (rest as any)._doc.typeId;
        const listSkills = skills.map(skill => {
            return (skill as any).skillId.name
        });
        const returnJob = {
            jobId: _id.toString(),
            position: (positionId as any).name,
            location: (locationId as any).name,
            jobType: (typeId as any).name,
            ...(rest as any)._doc,
            skills: listSkills
        };
        res.status(200).json({success: true, message: 'Đã tìm thấy job', statusCode: 200, result: returnJob});
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null
        };
        next(err);
    };
};