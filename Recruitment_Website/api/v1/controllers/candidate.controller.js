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
exports.getAllInterviews = exports.getInformation = exports.saveInformation = exports.getAppliedJobs = exports.applyJob = exports.checkApply = exports.deleteResume = exports.uploadResume = exports.getResumes = void 0;
const express_validator_1 = require("express-validator");
const utils_1 = require("../utils");
const candidateService = __importStar(require("../services/candidate.service"));
const getResumes = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyToken)(accessToken);
        const candidateId = decodedToken.userId;
        const { listResumes, resumeLength } = await candidateService.getResumes(candidateId);
        res.status(200).json({ success: true, message: 'Lấy list resumes thành công', result: { content: listResumes, resumesLength: resumeLength }, statusCode: 200 });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        next(err);
    }
    ;
};
exports.getResumes = getResumes;
const uploadResume = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyToken)(accessToken);
        const candidateId = decodedToken.userId;
        if (!req.files || !req.files.resumeFile) {
            const error = new Error('Không có tệp nào được tải lên!');
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        ;
        const resume = req.files.resumeFile;
        if (!(0, utils_1.isPDF)(resume)) {
            const error = new Error('Resume chỉ cho phép file pdf');
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        ;
        const cvInfo = await candidateService.uploadResume(candidateId, resume);
        res.status(200).json({ success: true, message: 'Upload resume thành công', result: cvInfo, statusCode: 200 });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        ;
        next(err);
    }
    ;
};
exports.uploadResume = uploadResume;
const deleteResume = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyToken)(accessToken);
        const candidateId = decodedToken.userId;
        const resumeId = req.params.resumeId;
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            const error = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        ;
        await candidateService.deleteResume(candidateId, resumeId);
        res.status(200).json({ success: true, message: 'Xóa resume thành công', statusCode: 200 });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        next(err);
    }
    ;
};
exports.deleteResume = deleteResume;
const checkApply = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyToken)(accessToken);
        const candidateId = decodedToken.userId;
        const jobId = req.params.jobId;
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            const error = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        ;
        const { message, result } = await candidateService.checkApply(candidateId, jobId);
        res.status(200).json({ success: true, message: message, result: result });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        next(err);
    }
};
exports.checkApply = checkApply;
const applyJob = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyToken)(accessToken);
        const candidateId = decodedToken.userId;
        const jobId = req.params.jobId;
        const resumeId = req.body.resumeId;
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            const error = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        ;
        const { result } = await candidateService.applyJob(candidateId, jobId, resumeId);
        res.status(200).json({ success: true, message: 'Apply thành công', result: result });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        next(err);
    }
};
exports.applyJob = applyJob;
const getAppliedJobs = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyToken)(accessToken);
        const candidateId = decodedToken.userId;
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
        const { retunAppliedJobs, appliedJobsLength } = await candidateService.getAppliedJobs(candidateId, page, limit);
        res.status(200).json({
            success: true, message: 'Lấy danh sách thành công', result: {
                pageNumber: page,
                totalPages: Math.ceil(appliedJobsLength / limit),
                limit: limit,
                totalElements: appliedJobsLength,
                content: retunAppliedJobs
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
exports.getAppliedJobs = getAppliedJobs;
const saveInformation = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyToken)(accessToken);
        const candidateId = decodedToken.userId;
        const { education, experience, certificate, project, skills } = req.body;
        await candidateService.saveInformation(candidateId, education, experience, certificate, project, skills);
        res.status(200).json({ success: true, message: "Successfully!", result: null });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        next(err);
    }
};
exports.saveInformation = saveInformation;
const getInformation = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyToken)(accessToken);
        const candidateId = decodedToken.userId;
        const result = await candidateService.getInformation(candidateId);
        res.status(200).json({ success: true, message: "Successfully!", result: result });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        next(err);
    }
};
exports.getInformation = getInformation;
const getAllInterviews = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyToken)(accessToken);
        const candidateId = decodedToken.userId;
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
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        next(err);
    }
};
exports.getAllInterviews = getAllInterviews;
