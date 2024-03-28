import { Request, NextFunction, Response } from 'express';
import { validationResult } from 'express-validator';
import { jobService } from '../services/job.service';

export const jobController = {
    getJobs: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const page: number = req.query.page ? +req.query.page : 1;
            const limit: number = req.query.limit ? +req.query.limit : 10;
            const errors = validationResult(req);
            const { name, type, position, location } = req.query;
            if (!errors.isEmpty()) {
                const error: Error & { statusCode?: any, result?: any } = new Error(errors.array()[0].msg);
                error.statusCode = 400;
                error.result = {
                    content: []
                };
                throw error;
            };
            const { listjobs, jobLength } = await jobService.getJobs(name, type, position, location, page, limit);
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
    },
    getLocation: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const listLocation = jobService.getLocation();
            res.status(200).json({ success: true, message: 'Lấy list Location thành công', statusCode: 200, result: listLocation });
        } catch (err) {
            if (!(err as any).statusCode) {
                (err as any).statusCode = 500;
                (err as any).result = null
            };
            next(err);
        };
    },
    getPosition: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const listPosition = jobService.getPosition();
            res.status(200).json({ success: true, message: 'Lấy list Position thành công', statusCode: 200, result: listPosition });
        } catch (err) {
            if (!(err as any).statusCode) {
                (err as any).statusCode = 500;
                (err as any).result = null
            };
            next(err);
        };
    },
    getType: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const listType = jobService.getType();
            res.status(200).json({ success: true, message: 'Lấy list Type thành công', statusCode: 200, result: listType });
        } catch (err) {
            if (!(err as any).statusCode) {
                (err as any).statusCode = 500;
                (err as any).result = null
            };
            next(err);
        };
    },
    getSingleJob: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
    }
}
