import { NextFunction, Request, Response } from 'express';
import { adminService } from '../services/admin.service';
import { verifyAccessToken } from '../utils';
import { validationResult } from 'express-validator';

export const adminController = {
    getAllAccounts: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authHeader = req.get('Authorization') as string;
            const accessToken = authHeader.split(' ')[1];
            const decodedToken: any = await verifyAccessToken(accessToken);
            const adminId = decodedToken.userId;
            const { searchText, searchBy, active } = req.query;
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
            const { accountLength, accounts } = await adminService.getAllAccounts(adminId, searchText, searchBy, active, page, limit);
            res.status(200).json({
                success: true, message: "Get list interview Successfully!", result: {
                    pageNumber: page,
                    totalPages: Math.ceil(accountLength / limit),
                    limit: limit,
                    totalElements: accountLength,
                    content: accounts
                }
            });
        } catch (err) {
            if (!(err as any).statusCode) {
                (err as any).statusCode = 500;
                (err as any).result = null;
            }
            next(err);
        }
    },
    getAllRecruiterAccounts: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authHeader = req.get('Authorization') as string;
            const accessToken = authHeader.split(' ')[1];
            const decodedToken: any = await verifyAccessToken(accessToken);
            const adminId = decodedToken.userId;
            const { searchText, searchBy, active } = req.query;
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
            const { accountLength, accounts } = await adminService.getAllRecruiterAccounts(adminId, searchText, searchBy, active, page, limit);
            res.status(200).json({
                success: true, message: "Get list interview Successfully!", result: {
                    pageNumber: page,
                    totalPages: Math.ceil(accountLength / limit),
                    limit: limit,
                    totalElements: accountLength,
                    content: accounts
                }
            });
        } catch (err) {
            if (!(err as any).statusCode) {
                (err as any).statusCode = 500;
                (err as any).result = null;
            }
            next(err);
        }
    },
    getAllInterviewerAccounts: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authHeader = req.get('Authorization') as string;
            const accessToken = authHeader.split(' ')[1];
            const decodedToken: any = await verifyAccessToken(accessToken);
            const adminId = decodedToken.userId;
            const { searchText, searchBy, active } = req.query;
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
            const { accountLength, accounts } = await adminService.getAllInterviewerAccounts(adminId, searchText, searchBy, active, page, limit);
            res.status(200).json({
                success: true, message: "Get list interview Successfully!", result: {
                    pageNumber: page,
                    totalPages: Math.ceil(accountLength / limit),
                    limit: limit,
                    totalElements: accountLength,
                    content: accounts
                }
            });
        } catch (err) {
            if (!(err as any).statusCode) {
                (err as any).statusCode = 500;
                (err as any).result = null;
            }
            next(err);
        }
    },
    getAllCandidateAccounts: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authHeader = req.get('Authorization') as string;
            const accessToken = authHeader.split(' ')[1];
            const decodedToken: any = await verifyAccessToken(accessToken);
            const adminId = decodedToken.userId;
            const { searchText, searchBy, active } = req.query;
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
            const { accountLength, accounts } = await adminService.getAllCandidateAccounts(adminId, searchText, searchBy, active, page, limit);
            res.status(200).json({
                success: true, message: "Get list interview Successfully!", result: {
                    pageNumber: page,
                    totalPages: Math.ceil(accountLength / limit),
                    limit: limit,
                    totalElements: accountLength,
                    content: accounts
                }
            });
        } catch (err) {
            if (!(err as any).statusCode) {
                (err as any).statusCode = 500;
                (err as any).result = null;
            }
            next(err);
        }
    },
    getAllBlackListAccounts: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authHeader = req.get('Authorization') as string;
            const accessToken = authHeader.split(' ')[1];
            const decodedToken: any = await verifyAccessToken(accessToken);
            const adminId = decodedToken.userId;
            const { searchText, searchBy, active } = req.query;
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
            const { accountLength, accounts } = await adminService.getAllBlackListAccounts(adminId, searchText, searchBy, active, page, limit);
            res.status(200).json({
                success: true, message: "Get list interview Successfully!", result: {
                    pageNumber: page,
                    totalPages: Math.ceil(accountLength / limit),
                    limit: limit,
                    totalElements: accountLength,
                    content: accounts
                }
            });
        } catch (err) {
            if (!(err as any).statusCode) {
                (err as any).statusCode = 500;
                (err as any).result = null;
            }
            next(err);
        }
    },
    addBlackList: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authHeader = req.get('Authorization') as string;
            const accessToken = authHeader.split(' ')[1];
            const decodedToken: any = await verifyAccessToken(accessToken);
            const adminId = decodedToken.userId;
            const userId = req.params.userId;
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                const error: Error & { statusCode?: any, result?: any } = new Error(errors.array()[0].msg);
                error.statusCode = 400;
                error.result = {
                    content: []
                };
                throw error;
            }
            await adminService.addBlackList(adminId, userId);
            res.status(200).json({ success: true, message: "Add black list successfully!", result: null });
        } catch (err) {
            if (!(err as any).statusCode) {
                (err as any).statusCode = 500;
                (err as any).result = null;
            }
            next(err);
        }
    },
    removeBlackList: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authHeader = req.get('Authorization') as string;
            const accessToken = authHeader.split(' ')[1];
            const decodedToken: any = await verifyAccessToken(accessToken);
            const adminId = decodedToken.userId;
            const candidateId = req.params.candidateId;
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                const error: Error & { statusCode?: any, result?: any } = new Error(errors.array()[0].msg);
                error.statusCode = 400;
                error.result = {
                    content: []
                };
                throw error;
            }
            await adminService.removeBlackList(adminId, candidateId);
            res.status(200).json({ success: true, message: "Remove black list successfully!", result: null });
        } catch (err) {
            if (!(err as any).statusCode) {
                (err as any).statusCode = 500;
                (err as any).result = null;
            }
            next(err);
        }
    },
    createAccount: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authHeader = req.get('Authorization') as string;
            const accessToken = authHeader.split(' ')[1];
            const decodedToken: any = await verifyAccessToken(accessToken);
            const adminId = decodedToken.userId;
            const { fullName, email, password, confirmPassword, phone, position } = req.body;
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                const error: Error & { statusCode?: any, result?: any } = new Error(errors.array()[0].msg);
                error.statusCode = 400;
                error.result = {
                    content: []
                };
                throw error;
            }
            if (confirmPassword !== password) {
                const error: Error & { statusCode?: number, result?: any } = new Error('Mật khẩu xác nhận không chính xác');
                error.statusCode = 400;
                error.result = null;
                throw error;
            }
            await adminService.createAccount(adminId, fullName, email, password, phone, position);
            res.status(200).json({ success: true, message: "Tạo tài khoản thành công!", result: null });
        } catch (err) {
            if (!(err as any).statusCode) {
                (err as any).statusCode = 500;
                (err as any).result = null;
            }
            next(err);
        }
    },
    getAllJobs: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authHeader = req.get('Authorization') as string;
            const accessToken = authHeader.split(' ')[1];
            const decodedToken: any = await verifyAccessToken(accessToken);
            const adminId = decodedToken.userId;
            const { recruiterName, jobName } = req.query;
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
            const { jobLength, listJobs } = await adminService.getAllJobs(adminId, recruiterName, jobName, page, limit);
            res.status(200).json({
                success: true, message: "Get all jobs successfully!", result: {
                    pageNumber: page,
                    totalPages: Math.ceil(jobLength / limit),
                    limit: limit,
                    totalElements: jobLength,
                    content: listJobs
                }
            });
        } catch (err) {
            if (!(err as any).statusCode) {
                (err as any).statusCode = 500;
                (err as any).result = null;
            }
            next(err);
        }
    },
    getAllEvents: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authHeader = req.get('Authorization') as string;
            const accessToken = authHeader.split(' ')[1];
            const decodedToken: any = await verifyAccessToken(accessToken);
            const adminId = decodedToken.userId;
            const { recruiterName, eventName } = req.query;
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
            const { eventLength, listEvents } = await adminService.getAllEvents(adminId, recruiterName, eventName, page, limit);
            res.status(200).json({
                success: true, message: "Get all events successfully!", result: {
                    pageNumber: page,
                    totalPages: Math.ceil(eventLength / limit),
                    limit: limit,
                    totalElements: eventLength,
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
    },
    adminStatistics: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authHeader = req.get('Authorization') as string;
            const accessToken = authHeader.split(' ')[1];
            const decodedToken: any = await verifyAccessToken(accessToken);
            const adminId = decodedToken.userId;
            const { jobNumber, eventNumber, blackListNumber, candidatePassNumber } = await adminService.adminStatistics(adminId);
            res.status(200).json({
                success: true, message: "Get statistics successfully!", result: {
                    jobCount: jobNumber,
                    eventCount: eventNumber,
                    blackListCount: blackListNumber,
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
    }
}


