import { NextFunction, Request, Response } from 'express';
import { verifyAccessToken } from '../utils';
import { validationResult } from 'express-validator';
import { UploadedFile } from 'express-fileupload';
import * as recruiterService from '../services/recruiter.service';


export const getAllJobs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.get('Authorization') as string;
        const accessToken = authHeader.split(' ')[1];
        const decodedToken: any = await verifyAccessToken(accessToken);
        const recruiterId = decodedToken.userId;
        const { name, type, position, location, active } = req.query;
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
        const { listjobs, jobLength } = await recruiterService.getAllJobs(recruiterId, name, type, position, location, active, page, limit);
        res.status(200).json({
            success: true, message: 'Get list jobs successfully', statusCode: 200, result: {
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
            (err as any).result = null;
        }
        next(err);
    }
};

export const createJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.get('Authorization') as string;
        const accessToken = authHeader.split(' ')[1];
        const { name, jobType, quantity, benefit, salaryRange,
            requirement, location, description, deadline, position, skillRequired } = req.body;
        const errors = validationResult(req);
        const decodedToken: any = await verifyAccessToken(accessToken);
        const recruiterId = decodedToken.userId;
        if (!errors.isEmpty()) {
            const error: Error & { statusCode?: any, result?: any } = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        await recruiterService.createJob(recruiterId, name, position, jobType, quantity, benefit, salaryRange,
            requirement, location, description, deadline, skillRequired);
        res.status(200).json({ success: true, message: "Tạo job thành công", result: null })
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null;
        }
        next(err);
    }
};

export const getSingleJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.get('Authorization') as string;
        const accessToken = authHeader.split(' ')[1];
        const decodedToken: any = await verifyAccessToken(accessToken);
        const recruiterId = decodedToken.userId;
        const jobId = req.params.jobId;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error: Error & { statusCode?: any, result?: any } = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        };
        const returnJob = await recruiterService.getSingleJob(recruiterId, jobId);
        res.status(200).json({ sucess: true, message: 'Đã tìm thấy job', result: returnJob });
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null;
        }
        next(err);
    }
};

export const updateJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.get('Authorization') as string;
        const accessToken = authHeader.split(' ')[1];
        const decodedToken: any = await verifyAccessToken(accessToken);
        const recruiterId = decodedToken.userId;
        const jobId = req.params.jobId;
        const { name, jobType, quantity, benefit, salaryRange,
            requirement, location, description, deadline, position, skillRequired } = req.body;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error: Error & { statusCode?: any, result?: any } = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        };
        await recruiterService.updateJob(recruiterId, jobId, name, position, jobType, quantity, benefit, salaryRange, requirement, location,
            description, deadline, skillRequired);
        res.status(200).json({ sucess: true, message: 'Update job thành công', result: null });
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null;
        }
        next(err);
    }
};

export const deleteJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.get('Authorization') as string;
        const accessToken = authHeader.split(' ')[1];
        const decodedToken: any = await verifyAccessToken(accessToken);
        const recruiterId = decodedToken.userId;
        const jobId = req.params.jobId;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error: Error & { statusCode?: any, result?: any } = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        };
        await recruiterService.deleteJob(recruiterId, jobId);
        res.status(200).json({ sucess: true, message: 'Xóa job thành công', result: null });
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null;
        }
        next(err);
    }
};

export const getAllEvents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.get('Authorization') as string;
        const accessToken = authHeader.split(' ')[1];
        const decodedToken: any = await verifyAccessToken(accessToken);
        const recruiterId = decodedToken.userId;
        const name = req.query.name;
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
        const query: any = {
            authorId: recruiterId,
            isActive: req.query['active'] ? req.query['active'] : true
        };
        if (name) {
            query['name'] = new RegExp((name as any), 'i');
        };
        const { listEvents, eventLenght } = await recruiterService.getAllEvents(recruiterId, query, page, limit);
        res.status(200).json({
            success: true, message: 'Get list events successfully', statusCode: 200, result: {
                pageNumber: page,
                totalPages: Math.ceil(eventLenght / limit),
                limit: limit,
                totalElements: eventLenght,
                content: listEvents
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

export const getSingleEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.get('Authorization') as string;
        const accessToken = authHeader.split(' ')[1];
        const decodedToken: any = await verifyAccessToken(accessToken);
        const recruiterId = decodedToken.userId;
        const eventId = req.params.eventId;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error: Error & { statusCode?: any, result?: any } = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        const returnEvent = await recruiterService.getSingleEvent(recruiterId, eventId);
        res.status(200).json({ success: true, message: 'Get event successfully', result: returnEvent });

    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null;
        }
        next(err);
    }
};

export const createEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.get('Authorization') as string;
        const accessToken = authHeader.split(' ')[1];
        const decodedToken: any = await verifyAccessToken(accessToken);
        const recruiterId = decodedToken.userId;
        const { title, name, description, time, location, deadline, startAt } = req.body;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error: Error & { statusCode?: any, result?: any } = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        if (!req.files || !req.files.image) {
            const error: Error & { statusCode?: any, result?: any } = new Error('Không có tệp nào được tải lên!');
            error.statusCode = 400;
            error.result = null;
            throw error;
        };
        const image: UploadedFile = req.files.image as UploadedFile;
        if (image.mimetype !== 'image/jpg' && image.mimetype !== 'image/png' && image.mimetype !== 'image/jpeg') {
            const error: Error & { statusCode?: any, result?: any } = new Error('File ảnh chỉ được phép là jpg,png,jpeg');
            error.statusCode = 400;
            error.result = null;
            throw error;
        };
        await recruiterService.createEvent(recruiterId, image, title, name, description, time, location, deadline, startAt);
        res.status(200).json({ success: true, message: 'Thêm event thành công', result: null });

    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null;
        }
        next(err);
    }
};

export const updateEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.get('Authorization') as string;
        const accessToken = authHeader.split(' ')[1];
        const decodedToken: any = await verifyAccessToken(accessToken);
        const recruiterId = decodedToken.userId;
        const eventId = req.params.eventId;
        const { title, name, description, time, location, deadline, startAt } = req.body;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error: Error & { statusCode?: any, result?: any } = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        const image = req.files ? req.files.image : null;
        await recruiterService.updateEvent(recruiterId, eventId, image, title, name, description, time, location, deadline, startAt);
        res.status(200).json({ success: true, message: 'Update event thành công', result: null });

    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null;
        }
        next(err);
    }
};

export const deleteEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.get('Authorization') as string;
        const accessToken = authHeader.split(' ')[1];
        const decodedToken: any = await verifyAccessToken(accessToken);
        const recruiterId = decodedToken.userId;
        const eventId = req.params.eventId;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error: Error & { statusCode?: any, result?: any } = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        await recruiterService.deleteEvent(recruiterId, eventId);
        res.status(200).json({ success: true, message: 'Xóa event thành công', result: null });

    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null;
        }
        next(err);
    }
};

export const getAllInterviewers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.get('Authorization') as string;
        const accessToken = authHeader.split(' ')[1];
        const decodedToken: any = await verifyAccessToken(accessToken);
        const recruiterId = decodedToken.userId;
        const { name, skill } = req.query;
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
        const { mappedInterviewers, interviewerLength } = await recruiterService.getAllInterviewers(recruiterId, name, skill, page, limit);
        res.status(200).json({
            success: true, message: 'Get list interviewers successfully', result: {
                pageNumber: page,
                totalPages: Math.ceil(interviewerLength / limit),
                limit: limit,
                totalElements: interviewerLength,
                content: mappedInterviewers
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

export const getSingleInterviewer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.get('Authorization') as string;
        const accessToken = authHeader.split(' ')[1];
        const decodedToken: any = await verifyAccessToken(accessToken);
        const recruiterId = decodedToken.userId;
        const interviewerId = req.params.interviewerId;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error: Error & { statusCode?: any, result?: any } = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        const returnInterviewer = await recruiterService.getSingleInterviewer(recruiterId, interviewerId);
        res.status(200).json({ success: true, message: 'Get interviewer successfully', result: returnInterviewer });

    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null;
        }
        next(err);
    }
};

export const getAllApplicants = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.get('Authorization') as string;
        const accessToken = authHeader.split(' ')[1];
        const decodedToken: any = await verifyAccessToken(accessToken);
        const recruiterId = decodedToken.userId;
        const { name, skill } = req.query;
        const page: number = req.query.page ? +req.query.page : 1;
        const limit: number = req.query.limit ? +req.query.limit : 10;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error: Error & { statusCode?: any, result?: any } = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        const { applicantList, applicantLength } = await recruiterService.getAllApplicants(recruiterId, name, skill, page, limit);
        res.status(200).json({
            success: true, message: 'Get list applicants successfully', result: {
                pageNumber: page,
                totalPages: Math.ceil(applicantLength / limit),
                limit: limit,
                totalElements: applicantLength,
                content: applicantList
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

export const getSingleApplicant = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.get('Authorization') as string;
        const accessToken = authHeader.split(' ')[1];
        const decodedToken: any = await verifyAccessToken(accessToken);
        const recruiterId = decodedToken.userId;
        const applicantId = req.params.userId;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error: Error & { statusCode?: any, result?: any } = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        const returnApplicant = await recruiterService.getSingleApplicant(recruiterId, applicantId);
        res.status(200).json({ success: true, message: 'Get applicant successfully', result: returnApplicant });
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null;
        }
        next(err);
    }
};

export const getApplicantsJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.get('Authorization') as string;
        const accessToken = authHeader.split(' ')[1];
        const decodedToken: any = await verifyAccessToken(accessToken);
        const recruiterId = decodedToken.userId;
        const jobId = req.params.jobId;
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
        const { applicantList, applicantsJobLength } = await recruiterService.getApplicantsJob(recruiterId, jobId, page, limit);
        res.status(200).json({
            success: true, message: 'Get list applicants successfully', result: {
                pageNumber: page,
                totalPages: Math.ceil(applicantsJobLength / limit),
                limit: limit,
                totalElements: applicantsJobLength,
                content: applicantList
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

export const getSingleApplicantJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.get('Authorization') as string;
        const accessToken = authHeader.split(' ')[1];
        const decodedToken: any = await verifyAccessToken(accessToken);
        const recruiterId = decodedToken.userId;
        const { jobId, candidateId } = req.params;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error: Error & { statusCode?: any, result?: any } = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = {
                content: []
            };
            throw error;
        }
        const returnApplicant = await recruiterService.getSingleApplicantJob(recruiterId, jobId, candidateId);
        res.status(200).json({ success: true, message: 'Get applicant successfully', result: returnApplicant });
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null;
        }
        next(err);
    }
};

export const createMeeting = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.get('Authorization') as string;
        const accessToken = authHeader.split(' ')[1];
        const decodedToken: any = await verifyAccessToken(accessToken);
        const recruiterId = decodedToken.userId;
        const { candidateId, interviewersId, time, jobApplyId } = req.body;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error: Error & { statusCode?: any, result?: any } = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = {
                content: []
            };
            throw error;
        }
        await recruiterService.createMeeting(recruiterId, candidateId, interviewersId, time, jobApplyId);
        res.status(200).json({ success: true, message: 'Create meeting successfully', result: null });
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null;
        }
        next(err);
    }
};

export const updateCandidateState = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.get('Authorization') as string;
        const accessToken = authHeader.split(' ')[1];
        const decodedToken: any = await verifyAccessToken(accessToken);
        const recruiterId = decodedToken.userId;
        const { candidateId, jobId, state } = req.body;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error: Error & { statusCode?: any, result?: any } = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        await recruiterService.updateCandidateState(recruiterId, candidateId, jobId, state);
        res.status(200).json({ success: true, message: 'Update state successfully', result: null });
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null;
        }
        next(err);
    }
};


export const getJobSuggestedCandidates = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.get('Authorization') as string;
        const accessToken = authHeader.split(' ')[1];
        const decodedToken: any = await verifyAccessToken(accessToken);
        const recruiterId = decodedToken.userId;
        const jobId = req.params.jobId;
        const page: number = req.query.page ? +req.query.page : 1;
        const limit: number = req.query.limit ? +req.query.limit : 10;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error: Error & { statusCode?: any, result?: any } = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        const { sugggestedCandidateList, suggestedCandidateLength } = await recruiterService.getJobSuggestedCandidates(recruiterId, jobId, page, limit);
        res.status(200).json({
            success: true, message: 'Get list applicants successfully', result: {
                pageNumber: page,
                totalPages: Math.ceil(suggestedCandidateLength / limit),
                limit: limit,
                totalElements: suggestedCandidateLength,
                content: sugggestedCandidateList
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

export const getInterviewsOfCandidate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.get('Authorization') as string;
        const accessToken = authHeader.split(' ')[1];
        const decodedToken: any = await verifyAccessToken(accessToken);
        const recruiterId = decodedToken.userId;
        const candidateId = req.params.candidateId;
        const page: number = req.query.page ? +req.query.page : 1;
        const limit: number = req.query.limit ? +req.query.limit : 10;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error: Error & { statusCode?: any, result?: any } = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        const { interviewList, interviewLength } = await recruiterService.getInterviewsOfCandidate(recruiterId, candidateId, page, limit);
        res.status(200).json({
            success: true, message: 'Get list interviews successfully', result: {
                pageNumber: page,
                totalPages: Math.ceil(interviewLength / limit),
                limit: limit,
                totalElements: interviewLength,
                content: interviewList
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

export const getInterviewsOfInterviewer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.get('Authorization') as string;
        const accessToken = authHeader.split(' ')[1];
        const decodedToken: any = await verifyAccessToken(accessToken);
        const recruiterId = decodedToken.userId;
        const interviewerId = req.params.interviewerId;
        const page: number = req.query.page ? +req.query.page : 1;
        const limit: number = req.query.limit ? +req.query.limit : 10;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error: Error & { statusCode?: any, result?: any } = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        const { interviewList, interviewLength } = await recruiterService.getInterviewsOfInterviewer(recruiterId, interviewerId, page, limit);
        res.status(200).json({
            success: true, message: 'Get list interviews successfully', result: {
                pageNumber: page,
                totalPages: Math.ceil(interviewLength / limit),
                limit: limit,
                totalElements: interviewLength,
                content: interviewList
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

export const recruiterStatistics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.get('Authorization') as string;
        const accessToken = authHeader.split(' ')[1];
        const decodedToken: any = await verifyAccessToken(accessToken);
        const recruiterId = decodedToken.userId;
        const { jobNumber, eventNumber, interviewNumber, candidatePassNumber } = await recruiterService.recruiterStatistics(recruiterId);
        res.status(200).json({
            success: true, message: 'Get statistics successfully', result: {
                createdJobCount: jobNumber,
                createdEventCount: eventNumber,
                createdInterviewCount: interviewNumber,
                candidatePassCount: candidatePassNumber
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