"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.candidateController = void 0;
const express_validator_1 = require("express-validator");
const utils_1 = require("../utils");
const candidate_service_1 = require("../services/candidate.service");
const http_errors_1 = __importDefault(require("http-errors"));
exports.candidateController = {
    getResumes: async (req, res, next) => {
        try {
            const authHeader = req.get('Authorization');
            const accessToken = authHeader.split(' ')[1];
            const decodedToken = await (0, utils_1.verifyAccessToken)(accessToken);
            const candidateId = decodedToken.userId;
            const { listResumes, resumeLength } = await candidate_service_1.candidateService.getResumes(candidateId);
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
    },
    uploadResume: async (req, res, next) => {
        try {
            const authHeader = req.get('Authorization');
            const accessToken = authHeader.split(' ')[1];
            const decodedToken = await (0, utils_1.verifyAccessToken)(accessToken);
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
            const cvInfo = await candidate_service_1.candidateService.uploadResume(candidateId, resume);
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
    },
    deleteResume: async (req, res, next) => {
        try {
            const authHeader = req.get('Authorization');
            const accessToken = authHeader.split(' ')[1];
            const decodedToken = await (0, utils_1.verifyAccessToken)(accessToken);
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
            await candidate_service_1.candidateService.deleteResume(candidateId, resumeId);
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
    },
    checkApply: async (req, res, next) => {
        try {
            const authHeader = req.get('Authorization');
            const accessToken = authHeader.split(' ')[1];
            const decodedToken = await (0, utils_1.verifyAccessToken)(accessToken);
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
            const { message, result } = await candidate_service_1.candidateService.checkApply(candidateId, jobId);
            res.status(200).json({ success: true, message: message, result: result });
        }
        catch (err) {
            if (!err.statusCode) {
                err.statusCode = 500;
                err.result = null;
            }
            next(err);
        }
    },
    applyJob: async (req, res, next) => {
        try {
            const authHeader = req.get('Authorization');
            const accessToken = authHeader.split(' ')[1];
            const decodedToken = await (0, utils_1.verifyAccessToken)(accessToken);
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
            const { result } = await candidate_service_1.candidateService.applyJob(candidateId, jobId, resumeId);
            res.status(200).json({ success: true, message: 'Apply thành công', result: result });
        }
        catch (err) {
            if (!err.statusCode) {
                err.statusCode = 500;
                err.result = null;
            }
            next(err);
        }
    },
    getAppliedJobs: async (req, res, next) => {
        try {
            const authHeader = req.get('Authorization');
            const accessToken = authHeader.split(' ')[1];
            const decodedToken = await (0, utils_1.verifyAccessToken)(accessToken);
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
            const { retunAppliedJobs, appliedJobsLength } = await candidate_service_1.candidateService.getAppliedJobs(candidateId, page, limit);
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
    },
    saveInformation: async (req, res, next) => {
        try {
            const authHeader = req.get('Authorization');
            const accessToken = authHeader.split(' ')[1];
            const decodedToken = await (0, utils_1.verifyAccessToken)(accessToken);
            const candidateId = decodedToken.userId;
            const { education, experience, certificate, project, skills } = req.body;
            await candidate_service_1.candidateService.saveInformation(candidateId, education, experience, certificate, project, skills);
            res.status(200).json({ success: true, message: "Successfully!", result: null });
        }
        catch (err) {
            if (!err.statusCode) {
                err.statusCode = 500;
                err.result = null;
            }
            next(err);
        }
    },
    getInformation: async (req, res, next) => {
        try {
            const authHeader = req.get('Authorization');
            const accessToken = authHeader.split(' ')[1];
            const decodedToken = await (0, utils_1.verifyAccessToken)(accessToken);
            const candidateId = decodedToken.userId;
            const result = await candidate_service_1.candidateService.getInformation(candidateId);
            res.status(200).json({ success: true, message: "Successfully!", result: result });
        }
        catch (err) {
            if (!err.statusCode) {
                err.statusCode = 500;
                err.result = null;
            }
            next(err);
        }
    },
    getAllInterviews: async (req, res, next) => {
        try {
            const authHeader = req.get('Authorization');
            const accessToken = authHeader.split(' ')[1];
            const decodedToken = await (0, utils_1.verifyAccessToken)(accessToken);
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
            const { returnListInterview, interviewLength } = await candidate_service_1.candidateService.getAllInterviews(candidateId, page, limit);
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
    },
    addFavoriteJob: async (req, res, next) => {
        try {
            const authHeader = req.get('Authorization');
            const accessToken = authHeader.split(' ')[1];
            const decodedToken = await (0, utils_1.verifyAccessToken)(accessToken);
            const candidateId = decodedToken.userId;
            const jobId = req.params.jobId;
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                throw http_errors_1.default.BadRequest(errors.array()[0].msg);
            }
            await candidate_service_1.candidateService.addFavoriteJob(candidateId, jobId);
            res.status(200).json({ success: true, message: "Add job to favorite successfully!" });
        }
        catch (error) {
            next(error);
        }
    },
    getFavoriteJob: async (req, res, next) => {
        try {
            const authHeader = req.get('Authorization');
            const accessToken = authHeader.split(' ')[1];
            const decodedToken = await (0, utils_1.verifyAccessToken)(accessToken);
            const candidateId = decodedToken.userId;
            const favoriteJobs = await candidate_service_1.candidateService.getFavoriteJob(candidateId);
            res.status(200).json({ success: true, message: "Get list favorite job successfully!", result: favoriteJobs });
        }
        catch (error) {
            next(error);
        }
    }
};
