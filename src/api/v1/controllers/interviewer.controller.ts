import { NextFunction, Request, Response } from 'express';
import { verifyToken, questionType } from '../utils';
import { validationResult } from 'express-validator';
import { User } from '../models/user';
import * as interviewerService from '../services/interviewer.service';

export const saveInformation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.get('Authorization') as string;
        const accessToken = authHeader.split(' ')[1];
        const decodedToken: any = await verifyToken(accessToken);
        const interviewerId = decodedToken.userId;
        const { education, experience, certificate, project, skills } = req.body;
        await interviewerService.saveInformation(interviewerId, education, experience, certificate, project, skills);
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
        const interviewerId = decodedToken.userId;
        const result = await interviewerService.getInformation(interviewerId);
        res.status(200).json({ success: true, message: "Successfully!", result: result });
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
        const decodedToken: any = await verifyToken(accessToken);
        const interviewerId = decodedToken.userId;
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
        const { applicantLength, listApplicants } = await interviewerService.getAllApplicants(interviewerId, page, limit);
        res.status(200).json({
            success: true, message: "Successfully!", result: {
                pageNumber: page,
                totalPages: Math.ceil(applicantLength / limit),
                limit: limit,
                totalElements: applicantLength,
                content: listApplicants
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
        const decodedToken: any = await verifyToken(accessToken);
        const interviewerId = decodedToken.userId;
        const candidateId = req.params.candidateId;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error: Error & { statusCode?: any, result?: any } = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        const returnCandidate = await interviewerService.getSingleApplicant(interviewerId, candidateId);
        res.status(200).json({ success: true, message: 'Get applicant successfully.', result: returnCandidate });
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
        const interviewerId = decodedToken.userId;
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
        const { interviewLength, returnListInterviews } = await interviewerService.getAllInterviews(interviewerId, page, limit);
        res.status(200).json({
            success: true, message: "Get list interview Successfully!", result: {
                pageNumber: page,
                totalPages: Math.ceil(interviewLength / limit),
                limit: limit,
                totalElements: interviewLength,
                content: returnListInterviews
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

export const getSingleInterview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.get('Authorization') as string;
        const accessToken = authHeader.split(' ')[1];
        const decodedToken: any = await verifyToken(accessToken);
        const interviewerId = decodedToken.userId;
        const interviewId = req.params.interviewId;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error: Error & { statusCode?: any, result?: any } = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        const returnInterview = await interviewerService.getSingleInterview(interviewerId, interviewId);
        res.status(200).json({ success: true, message: "Get interview Successfully!", result: returnInterview });
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null;
        }
        next(err);
    }
};

export const createQuestion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.get('Authorization') as string;
        const accessToken = authHeader.split(' ')[1];
        const decodedToken: any = await verifyToken(accessToken);
        const interviewerId = decodedToken.userId;
        const { content, type, skill, note } = req.body;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error: Error & { statusCode?: any, result?: any } = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        const result = await interviewerService.createQuestion(interviewerId, content, type, skill, note);
        res.status(200).json({ success: true, message: 'Create question successfully.', result: result });
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null;
        }
        next(err);
    }
};

export const getAllQuestions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.get('Authorization') as string;
        const accessToken = authHeader.split(' ')[1];
        const decodedToken: any = await verifyToken(accessToken);
        const interviewerId = decodedToken.userId;
        const { skill, type, content } = req.query;
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
        const { questionLength, returnListQuestions } = await interviewerService.getAllQuestions(interviewerId, skill, type, content, page, limit);
        res.status(200).json({
            success: true, message: 'Get list questions successfully.', result: {
                pageNumber: page,
                totalPages: Math.ceil(questionLength / limit),
                limit: limit,
                totalElements: questionLength,
                content: returnListQuestions
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

export const getSingleQuestion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.get('Authorization') as string;
        const accessToken = authHeader.split(' ')[1];
        const decodedToken: any = await verifyToken(accessToken);
        const interviewerId = decodedToken.userId;
        const questionId = req.params.questionId;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error: Error & { statusCode?: any, result?: any } = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        const returnQuestion = await interviewerService.getSingleQuestion(interviewerId, questionId);
        res.status(200).json({ success: true, message: 'Get question successfully.', result: returnQuestion });
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null;
        }
        next(err);
    }
};

export const updateQuestion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.get('Authorization') as string;
        const accessToken = authHeader.split(' ')[1];
        const decodedToken: any = await verifyToken(accessToken);
        const interviewerId = decodedToken.userId;
        const questionId = req.params.questionId;
        const { content, type, skill, note } = req.body;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error: Error & { statusCode?: any, result?: any } = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        await interviewerService.updateQuestion(interviewerId, questionId, content, type, skill, note);
        res.status(200).json({ success: true, message: 'Update question successfully.', result: null });
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null;
        }
        next(err);
    }
};

export const deleteQuestion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.get('Authorization') as string;
        const accessToken = authHeader.split(' ')[1];
        const decodedToken: any = await verifyToken(accessToken);
        const interviewerId = decodedToken.userId;
        const questionId = req.params.questionId;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error: Error & { statusCode?: any, result?: any } = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        await interviewerService.deleteQuestion(interviewerId, questionId);
        res.status(200).json({ success: true, message: 'Delete question successfully.', result: null });
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null;
        }
        next(err);
    }
};

export const getSkillQuestion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.get('Authorization') as string;
        const accessToken = authHeader.split(' ')[1];
        const decodedToken: any = await verifyToken(accessToken);
        const interviewerId = decodedToken.userId;
        const returnSkills = await interviewerService.getSkillQuestion(interviewerId);
        res.status(200).json({ success: true, message: 'Get question skills successfully.', result: returnSkills });
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null;
        }
        next(err);
    }
};


export const getTypeQuestion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.get('Authorization') as string;
        const accessToken = authHeader.split(' ')[1];
        const decodedToken: any = await verifyToken(accessToken);
        const interviewer = await User.findById(decodedToken.userId).populate('roleId');
        if (interviewer?.get('roleId.roleName') !== 'INTERVIEWER') {
            const error: Error & { statusCode?: number, result?: any } = new Error('UnAuthorized');
            error.statusCode = 401;
            error.result = null;
            throw error;
        };
        const returnType = questionType;
        res.status(200).json({ success: true, message: 'Get question type successfully.', result: returnType });
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null;
        }
        next(err);
    }
};

export const getAssignQuestions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.get('Authorization') as string;
        const accessToken = authHeader.split(' ')[1];
        const decodedToken: any = await verifyToken(accessToken);
        const interviewerId = decodedToken.userId;
        const interviewId = req.params.interviewId;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error: Error & { statusCode?: any, result?: any } = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = [];
            throw error;
        }
        const returnQuestions = await interviewerService.getAssignQuestions(interviewerId, interviewId);
        res.status(200).json({ success: true, message: 'Get assigned questions successfully.', result: returnQuestions });
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null;
        }
        next(err);
    }
};

export const assignQuestions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.get('Authorization') as string;
        const accessToken = authHeader.split(' ')[1];
        const decodedToken: any = await verifyToken(accessToken);
        const interviewerId = decodedToken.userId;
        const questions = req.body.questions;
        const interviewId = req.params.interviewId;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error: Error & { statusCode?: any, result?: any } = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        await interviewerService.assignQuestions(interviewerId, questions, interviewId);
        res.status(200).json({ success: true, message: 'Assign questions successfully.', result: null });
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null;
        }
        next(err);
    }
};

export const updateQuestions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.get('Authorization') as string;
        const accessToken = authHeader.split(' ')[1];
        const decodedToken: any = await verifyToken(accessToken);
        const interviewerId = decodedToken.userId;
        const questions = req.body.questions;
        const interviewId = req.params.interviewId;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error: Error & { statusCode?: any, result?: any } = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        await interviewerService.updateQuestions(interviewerId, questions, interviewId);
        res.status(200).json({ success: true, message: 'Update questions successfully.', result: null });
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null;
        }
        next(err);
    }
};

export const deleteAssignQuestion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.get('Authorization') as string;
        const accessToken = authHeader.split(' ')[1];
        const decodedToken: any = await verifyToken(accessToken);
        const interviewerId = decodedToken.userId;
        const questionId = req.params.questionId;
        const interviewId = req.params.interviewId;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error: Error & { statusCode?: any, result?: any } = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        await interviewerService.deleteAssignQuestion(interviewerId, questionId, interviewId);
        res.status(200).json({ success: true, message: 'Delete assign question successfully.', result: null });
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null;
        }
        next(err);
    }
};

export const submitTotalScore = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.get('Authorization') as string;
        const accessToken = authHeader.split(' ')[1];
        const decodedToken: any = await verifyToken(accessToken);
        const interviewerId = decodedToken.userId;
        const interviewId = req.params.interviewId;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error: Error & { statusCode?: any, result?: any } = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        await interviewerService.submitTotalScore(interviewerId, interviewId);
        res.status(200).json({ success: true, message: 'Save score successfully.', result: null });
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null;
        }
        next(err);
    }
};

