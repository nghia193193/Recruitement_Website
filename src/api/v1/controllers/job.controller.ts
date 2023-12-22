import { Request, NextFunction, Response } from 'express';
import { Job } from '../models/job';
import { JobPosition } from '../models/jobPosition';
import { validationResult } from 'express-validator';
import { JobLocation } from '../models/jobLocation';
import { JobType } from '../models/jobType';
import * as jobService from '../services/job.service';

export const getJobs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const page: number = req.query.page ? +req.query.page : 1;
        const limit: number = req.query.limit ? +req.query.limit : 10;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error: Error & { statusCode?: any, result?: any } = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = {
                content: []
            };
            throw error;
        };
        const query: any = {
            isActive: true,
            deadline: { $gt: new Date() }
        };
        if (req.query['name']) {
            query['name'] = new RegExp((req.query['name'] as any), 'i');
        };
        if (req.query['type']) {
            const jobType = await JobType.findOne({ name: req.query['type'] });
            query['typeId'] = jobType?._id;
        };
        if (req.query['position']) {
            const jobPos = await JobPosition.findOne({ name: req.query['position'] });
            query['positionId'] = jobPos?._id;
        };
        if (req.query['location']) {
            const jobLoc = await JobLocation.findOne({ name: req.query['location'] });
            query['locationId'] = jobLoc?._id;
        };
        const { listjobs, jobLength } = await jobService.getJobs(query, page, limit);
        res.status(200).json({
            success: true, message: 'Successfully', statusCode: 200, result: {
                pageNumber: page,
                totalPages: Math.ceil(jobLength / limit),
                limit: limit,
                totalElements: jobLength,
                content: listjobs
            }
        });
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null
        };
        next(err);
    };
};

export const getLocation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const listLocation = await jobService.getLocation();
        res.status(200).json({ success: true, message: 'Lấy list Location thành công', statusCode: 200, result: listLocation });
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null
        };
        next(err);
    };
};

export const getPosition = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const listPosition = await jobService.getPosition();
        res.status(200).json({ success: true, message: 'Lấy list Position thành công', statusCode: 200, result: listPosition });
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null
        };
        next(err);
    };
};

export const getType = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const listType = await jobService.getType();
        res.status(200).json({ success: true, message: 'Lấy list Type thành công', statusCode: 200, result: listType });
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null
        };
        next(err);
    };
};

export const getSingleJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const jobId = req.params.jobId;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error: Error & { statusCode?: any, result?: any } = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        };
        const returnJob = await jobService.getSingleJob(jobId);
        res.status(200).json({ success: true, message: 'Đã tìm thấy job', statusCode: 200, result: returnJob });
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null
        };
        next(err);
    };
};