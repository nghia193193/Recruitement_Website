"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminStatistics = exports.getAllEvents = exports.getAllJobs = exports.createAccount = exports.removeBlackList = exports.addBlackList = exports.getAllBlackListAccounts = exports.getAllCandidateAccounts = exports.getAllInterviewerAccounts = exports.getAllRecruiterAccounts = exports.getAllAccounts = void 0;
const adminService = __importStar(require("../services/admin.service"));
const utils_1 = require("../utils");
const express_validator_1 = require("express-validator");
const getAllAccounts = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyToken)(accessToken);
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
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        next(err);
    }
};
exports.getAllAccounts = getAllAccounts;
const getAllRecruiterAccounts = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyToken)(accessToken);
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
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        next(err);
    }
};
exports.getAllRecruiterAccounts = getAllRecruiterAccounts;
const getAllInterviewerAccounts = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyToken)(accessToken);
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
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        next(err);
    }
};
exports.getAllInterviewerAccounts = getAllInterviewerAccounts;
const getAllCandidateAccounts = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyToken)(accessToken);
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
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        next(err);
    }
};
exports.getAllCandidateAccounts = getAllCandidateAccounts;
const getAllBlackListAccounts = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyToken)(accessToken);
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
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        next(err);
    }
};
exports.getAllBlackListAccounts = getAllBlackListAccounts;
const addBlackList = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyToken)(accessToken);
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
        await adminService.addBlackList(adminId, userId);
        res.status(200).json({ success: true, message: "Add black list successfully!", result: null });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        next(err);
    }
};
exports.addBlackList = addBlackList;
const removeBlackList = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyToken)(accessToken);
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
        await adminService.removeBlackList(adminId, candidateId);
        res.status(200).json({ success: true, message: "Remove black list successfully!", result: null });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        next(err);
    }
};
exports.removeBlackList = removeBlackList;
const createAccount = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyToken)(accessToken);
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
        await adminService.createAccount(adminId, fullName, email, password, phone, position);
        res.status(200).json({ success: true, message: "Tạo tài khoản thành công!", result: null });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        next(err);
    }
};
exports.createAccount = createAccount;
const getAllJobs = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyToken)(accessToken);
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
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        next(err);
    }
};
exports.getAllJobs = getAllJobs;
const getAllEvents = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyToken)(accessToken);
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
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        next(err);
    }
};
exports.getAllEvents = getAllEvents;
const adminStatistics = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyToken)(accessToken);
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
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        next(err);
    }
};
exports.adminStatistics = adminStatistics;
