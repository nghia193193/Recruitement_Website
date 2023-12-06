import { NextFunction, Request, Response } from 'express';
import * as adminService from '../services/admin.service';
import { verifyToken } from '../utils';
import { validationResult } from 'express-validator';

export const getAllAccounts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.get('Authorization') as string;
        const accessToken = authHeader.split(' ')[1];
        const decodedToken: any = await verifyToken(accessToken);
        const adminId = decodedToken.userId;
        const {searchText, searchBy, active} = req.query;
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
        const {accountLength, returnListAccounts} = await adminService.getAllAccounts(adminId, searchText, searchBy, active, page, limit);
        res.status(200).json({
            success: true, message: "Get list interview Successfully!", result: {
                pageNumber: page,
                totalPages: Math.ceil(accountLength / limit),
                limit: limit,
                totalElements: accountLength,
                content: returnListAccounts
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

export const getSingleAccount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.get('Authorization') as string;
        const accessToken = authHeader.split(' ')[1];
        const decodedToken: any = await verifyToken(accessToken);
        const adminId = decodedToken.userId;
        const accountId = req.params.userId;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error: Error & { statusCode?: any, result?: any } = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = {
                content: []
            };
            throw error;
        }
        const {returnAccount} = await adminService.getSingleAccount(adminId, accountId);
        res.status(200).json({
            success: true, message: "Get account successfully!", result: returnAccount});
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null;
        }
        next(err);
    }
};

export const getAllRecruiterAccounts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.get('Authorization') as string;
        const accessToken = authHeader.split(' ')[1];
        const decodedToken: any = await verifyToken(accessToken);
        const adminId = decodedToken.userId;
        const {searchText, searchBy, active} = req.query;
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
        const {accountLength, returnListAccounts} = await adminService.getAllRecruiterAccounts(adminId, searchText, searchBy, active, page, limit);
        res.status(200).json({
            success: true, message: "Get list interview Successfully!", result: {
                pageNumber: page,
                totalPages: Math.ceil(accountLength / limit),
                limit: limit,
                totalElements: accountLength,
                content: returnListAccounts
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

export const getAllInterviewerAccounts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.get('Authorization') as string;
        const accessToken = authHeader.split(' ')[1];
        const decodedToken: any = await verifyToken(accessToken);
        const adminId = decodedToken.userId;
        const {searchText, searchBy, active} = req.query;
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
        const {accountLength, returnListAccounts} = await adminService.getAllInterviewerAccounts(adminId, searchText, searchBy, active, page, limit);
        res.status(200).json({
            success: true, message: "Get list interview Successfully!", result: {
                pageNumber: page,
                totalPages: Math.ceil(accountLength / limit),
                limit: limit,
                totalElements: accountLength,
                content: returnListAccounts
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

export const getAllCandidateAccounts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.get('Authorization') as string;
        const accessToken = authHeader.split(' ')[1];
        const decodedToken: any = await verifyToken(accessToken);
        const adminId = decodedToken.userId;
        const {searchText, searchBy, active} = req.query;
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
        const {accountLength, returnListAccounts} = await adminService.getAllCandidateAccounts(adminId, searchText, searchBy, active, page, limit);
        res.status(200).json({
            success: true, message: "Get list interview Successfully!", result: {
                pageNumber: page,
                totalPages: Math.ceil(accountLength / limit),
                limit: limit,
                totalElements: accountLength,
                content: returnListAccounts
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

export const getAllBlackListAccounts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.get('Authorization') as string;
        const accessToken = authHeader.split(' ')[1];
        const decodedToken: any = await verifyToken(accessToken);
        const adminId = decodedToken.userId;
        const {searchText, searchBy, active} = req.query;
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
        const {accountLength, returnListAccounts} = await adminService.getAllBlackListAccounts(adminId, searchText, searchBy, active, page, limit);
        res.status(200).json({
            success: true, message: "Get list interview Successfully!", result: {
                pageNumber: page,
                totalPages: Math.ceil(accountLength / limit),
                limit: limit,
                totalElements: accountLength,
                content: returnListAccounts
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