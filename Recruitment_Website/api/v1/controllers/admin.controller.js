"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminController = void 0;
const admin_service_1 = require("../services/admin.service");
const utils_1 = require("../utils");
const express_validator_1 = require("express-validator");
exports.adminController = {
    getAllAccounts: async (req, res, next) => {
        try {
            const authHeader = req.get('Authorization');
            const accessToken = authHeader.split(' ')[1];
            const decodedToken = await (0, utils_1.verifyAccessToken)(accessToken);
            const adminId = decodedToken.userId;
            const { searchText, searchBy, active } = req.query;
            const page = req.query.page ? +req.query.page : 1;
            const limit = req.query.limit ? +req.query.limit : 10;
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                const error = new Error(errors.array()[0].msg);
                error.statusCode = 400;
                error.result = {
                    content: []
                };
                throw error;
            }
            const { accountLength, accounts } = await admin_service_1.adminService.getAllAccounts(adminId, searchText, searchBy, active, page, limit);
            res.status(200).json({
                success: true, message: "Get list interview Successfully!", result: {
                    pageNumber: page,
                    totalPages: Math.ceil(accountLength / limit),
                    limit: limit,
                    totalElements: accountLength,
                    content: accounts
                }
            });
        }
        catch (err) {
            if (!err.statusCode) {
                err.statusCode = 500;
                err.result = null;
            }
            next(err);
        }
    },
    getAllRecruiterAccounts: async (req, res, next) => {
        try {
            const authHeader = req.get('Authorization');
            const accessToken = authHeader.split(' ')[1];
            const decodedToken = await (0, utils_1.verifyAccessToken)(accessToken);
            const adminId = decodedToken.userId;
            const { searchText, searchBy, active } = req.query;
            const page = req.query.page ? +req.query.page : 1;
            const limit = req.query.limit ? +req.query.limit : 10;
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                const error = new Error(errors.array()[0].msg);
                error.statusCode = 400;
                error.result = {
                    content: []
                };
                throw error;
            }
            const { accountLength, accounts } = await admin_service_1.adminService.getAllRecruiterAccounts(adminId, searchText, searchBy, active, page, limit);
            res.status(200).json({
                success: true, message: "Get list interview Successfully!", result: {
                    pageNumber: page,
                    totalPages: Math.ceil(accountLength / limit),
                    limit: limit,
                    totalElements: accountLength,
                    content: accounts
                }
            });
        }
        catch (err) {
            if (!err.statusCode) {
                err.statusCode = 500;
                err.result = null;
            }
            next(err);
        }
    },
    getAllInterviewerAccounts: async (req, res, next) => {
        try {
            const authHeader = req.get('Authorization');
            const accessToken = authHeader.split(' ')[1];
            const decodedToken = await (0, utils_1.verifyAccessToken)(accessToken);
            const adminId = decodedToken.userId;
            const { searchText, searchBy, active } = req.query;
            const page = req.query.page ? +req.query.page : 1;
            const limit = req.query.limit ? +req.query.limit : 10;
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                const error = new Error(errors.array()[0].msg);
                error.statusCode = 400;
                error.result = {
                    content: []
                };
                throw error;
            }
            const { accountLength, accounts } = await admin_service_1.adminService.getAllInterviewerAccounts(adminId, searchText, searchBy, active, page, limit);
            res.status(200).json({
                success: true, message: "Get list interview Successfully!", result: {
                    pageNumber: page,
                    totalPages: Math.ceil(accountLength / limit),
                    limit: limit,
                    totalElements: accountLength,
                    content: accounts
                }
            });
        }
        catch (err) {
            if (!err.statusCode) {
                err.statusCode = 500;
                err.result = null;
            }
            next(err);
        }
    },
    getAllCandidateAccounts: async (req, res, next) => {
        try {
            const authHeader = req.get('Authorization');
            const accessToken = authHeader.split(' ')[1];
            const decodedToken = await (0, utils_1.verifyAccessToken)(accessToken);
            const adminId = decodedToken.userId;
            const { searchText, searchBy, active } = req.query;
            const page = req.query.page ? +req.query.page : 1;
            const limit = req.query.limit ? +req.query.limit : 10;
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                const error = new Error(errors.array()[0].msg);
                error.statusCode = 400;
                error.result = {
                    content: []
                };
                throw error;
            }
            const { accountLength, accounts } = await admin_service_1.adminService.getAllCandidateAccounts(adminId, searchText, searchBy, active, page, limit);
            res.status(200).json({
                success: true, message: "Get list interview Successfully!", result: {
                    pageNumber: page,
                    totalPages: Math.ceil(accountLength / limit),
                    limit: limit,
                    totalElements: accountLength,
                    content: accounts
                }
            });
        }
        catch (err) {
            if (!err.statusCode) {
                err.statusCode = 500;
                err.result = null;
            }
            next(err);
        }
    },
    getAllBlackListAccounts: async (req, res, next) => {
        try {
            const authHeader = req.get('Authorization');
            const accessToken = authHeader.split(' ')[1];
            const decodedToken = await (0, utils_1.verifyAccessToken)(accessToken);
            const adminId = decodedToken.userId;
            const { searchText, searchBy, active } = req.query;
            const page = req.query.page ? +req.query.page : 1;
            const limit = req.query.limit ? +req.query.limit : 10;
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                const error = new Error(errors.array()[0].msg);
                error.statusCode = 400;
                error.result = {
                    content: []
                };
                throw error;
            }
            const { accountLength, accounts } = await admin_service_1.adminService.getAllBlackListAccounts(adminId, searchText, searchBy, active, page, limit);
            res.status(200).json({
                success: true, message: "Get list interview Successfully!", result: {
                    pageNumber: page,
                    totalPages: Math.ceil(accountLength / limit),
                    limit: limit,
                    totalElements: accountLength,
                    content: accounts
                }
            });
        }
        catch (err) {
            if (!err.statusCode) {
                err.statusCode = 500;
                err.result = null;
            }
            next(err);
        }
    },
    addBlackList: async (req, res, next) => {
        try {
            const authHeader = req.get('Authorization');
            const accessToken = authHeader.split(' ')[1];
            const decodedToken = await (0, utils_1.verifyAccessToken)(accessToken);
            const adminId = decodedToken.userId;
            const userId = req.params.userId;
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                const error = new Error(errors.array()[0].msg);
                error.statusCode = 400;
                error.result = {
                    content: []
                };
                throw error;
            }
            await admin_service_1.adminService.addBlackList(adminId, userId);
            res.status(200).json({ success: true, message: "Add black list successfully!", result: null });
        }
        catch (err) {
            if (!err.statusCode) {
                err.statusCode = 500;
                err.result = null;
            }
            next(err);
        }
    },
    removeBlackList: async (req, res, next) => {
        try {
            const authHeader = req.get('Authorization');
            const accessToken = authHeader.split(' ')[1];
            const decodedToken = await (0, utils_1.verifyAccessToken)(accessToken);
            const adminId = decodedToken.userId;
            const candidateId = req.params.candidateId;
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                const error = new Error(errors.array()[0].msg);
                error.statusCode = 400;
                error.result = {
                    content: []
                };
                throw error;
            }
            await admin_service_1.adminService.removeBlackList(adminId, candidateId);
            res.status(200).json({ success: true, message: "Remove black list successfully!", result: null });
        }
        catch (err) {
            if (!err.statusCode) {
                err.statusCode = 500;
                err.result = null;
            }
            next(err);
        }
    },
    createAccount: async (req, res, next) => {
        try {
            const authHeader = req.get('Authorization');
            const accessToken = authHeader.split(' ')[1];
            const decodedToken = await (0, utils_1.verifyAccessToken)(accessToken);
            const adminId = decodedToken.userId;
            const { fullName, email, password, confirmPassword, phone, position } = req.body;
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                const error = new Error(errors.array()[0].msg);
                error.statusCode = 400;
                error.result = {
                    content: []
                };
                throw error;
            }
            if (confirmPassword !== password) {
                const error = new Error('Mật khẩu xác nhận không chính xác');
                error.statusCode = 400;
                error.result = null;
                throw error;
            }
            await admin_service_1.adminService.createAccount(adminId, fullName, email, password, phone, position);
            res.status(200).json({ success: true, message: "Tạo tài khoản thành công!", result: null });
        }
        catch (err) {
            if (!err.statusCode) {
                err.statusCode = 500;
                err.result = null;
            }
            next(err);
        }
    },
    getAllJobs: async (req, res, next) => {
        try {
            const authHeader = req.get('Authorization');
            const accessToken = authHeader.split(' ')[1];
            const decodedToken = await (0, utils_1.verifyAccessToken)(accessToken);
            const adminId = decodedToken.userId;
            const { recruiterName, jobName } = req.query;
            const page = req.query.page ? +req.query.page : 1;
            const limit = req.query.limit ? +req.query.limit : 10;
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                const error = new Error(errors.array()[0].msg);
                error.statusCode = 400;
                error.result = {
                    content: []
                };
                throw error;
            }
            const { jobLength, listJobs } = await admin_service_1.adminService.getAllJobs(adminId, recruiterName, jobName, page, limit);
            res.status(200).json({
                success: true, message: "Get all jobs successfully!", result: {
                    pageNumber: page,
                    totalPages: Math.ceil(jobLength / limit),
                    limit: limit,
                    totalElements: jobLength,
                    content: listJobs
                }
            });
        }
        catch (err) {
            if (!err.statusCode) {
                err.statusCode = 500;
                err.result = null;
            }
            next(err);
        }
    },
    getAllEvents: async (req, res, next) => {
        try {
            const authHeader = req.get('Authorization');
            const accessToken = authHeader.split(' ')[1];
            const decodedToken = await (0, utils_1.verifyAccessToken)(accessToken);
            const adminId = decodedToken.userId;
            const { recruiterName, eventName } = req.query;
            const page = req.query.page ? +req.query.page : 1;
            const limit = req.query.limit ? +req.query.limit : 10;
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                const error = new Error(errors.array()[0].msg);
                error.statusCode = 400;
                error.result = {
                    content: []
                };
                throw error;
            }
            const { eventLength, listEvents } = await admin_service_1.adminService.getAllEvents(adminId, recruiterName, eventName, page, limit);
            res.status(200).json({
                success: true, message: "Get all events successfully!", result: {
                    pageNumber: page,
                    totalPages: Math.ceil(eventLength / limit),
                    limit: limit,
                    totalElements: eventLength,
                    content: listEvents
                }
            });
        }
        catch (err) {
            if (!err.statusCode) {
                err.statusCode = 500;
                err.result = null;
            }
            next(err);
        }
    },
    adminStatistics: async (req, res, next) => {
        try {
            const authHeader = req.get('Authorization');
            const accessToken = authHeader.split(' ')[1];
            const decodedToken = await (0, utils_1.verifyAccessToken)(accessToken);
            const adminId = decodedToken.userId;
            const { jobNumber, eventNumber, blackListNumber, candidatePassNumber } = await admin_service_1.adminService.adminStatistics(adminId);
            res.status(200).json({
                success: true, message: "Get statistics successfully!", result: {
                    jobCount: jobNumber,
                    eventCount: eventNumber,
                    blackListCount: blackListNumber,
                    candidatePassCount: candidatePassNumber
                }
            });
        }
        catch (err) {
            if (!err.statusCode) {
                err.statusCode = 500;
                err.result = null;
            }
            next(err);
        }
    }
};
