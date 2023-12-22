import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { verifyToken, isPDF } from '../utils';
import { UploadedFile } from 'express-fileupload';
import * as candidateService from '../services/candidate.service';


export const getResumes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.get('Authorization') as string;
        const accessToken = authHeader.split(' ')[1];
        const decodedToken: any = await verifyToken(accessToken);
        const candidateId = decodedToken.userId;
        const { listResumes, resumeLength } = await candidateService.getResumes(candidateId);
        res.status(200).json({ success: true, message: 'Lấy list resumes thành công', result: { content: listResumes, resumesLength: resumeLength }, statusCode: 200 });
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null;
        }
        next(err);
    };
};

export const uploadResume = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.get('Authorization') as string;
        const accessToken = authHeader.split(' ')[1];
        const decodedToken: any = await verifyToken(accessToken);
        const candidateId = decodedToken.userId;
        if (!req.files || !req.files.resumeFile) {
            const error: Error & { statusCode?: number, result?: any } = new Error('Không có tệp nào được tải lên!');
            error.statusCode = 400;
            error.result = null;
            throw error;
        };
        const resume: UploadedFile = req.files.resumeFile as UploadedFile;
        if (!isPDF(resume)) {
            const error: Error & { statusCode?: number, result?: any } = new Error('Resume chỉ cho phép file pdf');
            error.statusCode = 400;
            error.result = null;
            throw error;
        };
        const cvInfo = await candidateService.uploadResume(candidateId, resume);
        res.status(200).json({ success: true, message: 'Upload resume thành công', result: cvInfo, statusCode: 200 });
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null;
        };
        next(err);
    };
};

export const deleteResume = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.get('Authorization') as string;
        const accessToken = authHeader.split(' ')[1];
        const decodedToken: any = await verifyToken(accessToken);
        const candidateId = decodedToken.userId;
        const resumeId = req.params.resumeId;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error: Error & { statusCode?: number, result?: any } = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        };
        await candidateService.deleteResume(candidateId, resumeId);
        res.status(200).json({ success: true, message: 'Xóa resume thành công', statusCode: 200 });
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null;
        }
        next(err);
    };
};

export const checkApply = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.get('Authorization') as string;
        const accessToken = authHeader.split(' ')[1];
        const decodedToken: any = await verifyToken(accessToken);
        const candidateId = decodedToken.userId;
        const jobId = req.params.jobId;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error: Error & { statusCode?: number, result?: any } = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        };
        const { message, result } = await candidateService.checkApply(candidateId, jobId);
        res.status(200).json({ success: true, message: message, result: result });
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null;
        }
        next(err);
    }
}

export const applyJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.get('Authorization') as string;
        const accessToken = authHeader.split(' ')[1];
        const decodedToken: any = await verifyToken(accessToken);
        const candidateId = decodedToken.userId;
        const jobId = req.params.jobId;
        const resumeId = req.body.resumeId;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error: Error & { statusCode?: number, result?: any } = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        };
        const { result } = await candidateService.applyJob(candidateId, jobId, resumeId);
        res.status(200).json({ success: true, message: 'Apply thành công', result: result })
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null;
        }
        next(err);
    }
};

export const getAppliedJobs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.get('Authorization') as string;
        const accessToken = authHeader.split(' ')[1];
        const decodedToken: any = await verifyToken(accessToken);
        const candidateId = decodedToken.userId;
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
        }
        const { retunAppliedJobs, appliedJobsLength } = await candidateService.getAppliedJobs(candidateId, page, limit);
        res.status(200).json({
            success: true, message: 'Lấy danh sách thành công', result: {
                pageNumber: page,
                totalPages: Math.ceil(appliedJobsLength / limit),
                limit: limit,
                totalElements: appliedJobsLength,
                content: retunAppliedJobs
            }
        })
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null;
        }
        next(err);
    }
};

export const saveInformation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.get('Authorization') as string;
        const accessToken = authHeader.split(' ')[1];
        const decodedToken: any = await verifyToken(accessToken);
        const candidateId = decodedToken.userId;
        const { education, experience, certificate, project, skills } = req.body;
        await candidateService.saveInformation(candidateId, education, experience, certificate, project, skills);
        res.status(200).json({ success: true, message: "Successfully!", result: null });
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null;
        }
        next(err);
    }
};

export const getInformation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.get('Authorization') as string;
        const accessToken = authHeader.split(' ')[1];
        const decodedToken: any = await verifyToken(accessToken);
        const candidateId = decodedToken.userId;
        const result = await candidateService.getInformation(candidateId);
        res.status(200).json({ success: true, message: "Successfully!", result: result });
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null;
        }
        next(err);
    }
};

export const getAllInterviews = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.get('Authorization') as string;
        const accessToken = authHeader.split(' ')[1];
        const decodedToken: any = await verifyToken(accessToken);
        const candidateId = decodedToken.userId;
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
        }
        const { returnListInterview, interviewLength } = await candidateService.getAllInterviews(candidateId, page, limit);
        res.status(200).json({
            success: true, message: "Successfully!", result: {
                pageNumber: page,
                totalPages: Math.ceil(interviewLength.length / limit),
                limit: limit,
                totalElements: interviewLength.length,
                content: returnListInterview
            }
        });
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null;
        }
        next(err);
    }
};


