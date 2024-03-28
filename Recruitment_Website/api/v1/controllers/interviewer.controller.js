"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.interviewerController = void 0;
const utils_1 = require("../utils");
const express_validator_1 = require("express-validator");
const user_1 = require("../models/user");
const interviewer_service_1 = require("../services/interviewer.service");
exports.interviewerController = {
    saveInformation: async (req, res, next) => {
        try {
            const authHeader = req.get('Authorization');
            const accessToken = authHeader.split(' ')[1];
            const decodedToken = await (0, utils_1.verifyAccessToken)(accessToken);
            const interviewerId = decodedToken.userId;
            const { education, experience, certificate, project, skills } = req.body;
            await interviewer_service_1.interviewerService.saveInformation(interviewerId, education, experience, certificate, project, skills);
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
            const interviewerId = decodedToken.userId;
            const result = await interviewer_service_1.interviewerService.getInformation(interviewerId);
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
    getAllApplicants: async (req, res, next) => {
        try {
            const authHeader = req.get('Authorization');
            const accessToken = authHeader.split(' ')[1];
            const decodedToken = await (0, utils_1.verifyAccessToken)(accessToken);
            const interviewerId = decodedToken.userId;
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
            const { applicantLength, listApplicants } = await interviewer_service_1.interviewerService.getAllApplicants(interviewerId, page, limit);
            res.status(200).json({
                success: true, message: "Successfully!", result: {
                    pageNumber: page,
                    totalPages: Math.ceil(applicantLength / limit),
                    limit: limit,
                    totalElements: applicantLength,
                    content: listApplicants
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
    getSingleApplicant: async (req, res, next) => {
        try {
            const authHeader = req.get('Authorization');
            const accessToken = authHeader.split(' ')[1];
            const decodedToken = await (0, utils_1.verifyAccessToken)(accessToken);
            const interviewerId = decodedToken.userId;
            const candidateId = req.params.candidateId;
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                const error = new Error(errors.array()[0].msg);
                error.statusCode = 400;
                error.result = null;
                throw error;
            }
            const returnCandidate = await interviewer_service_1.interviewerService.getSingleApplicant(interviewerId, candidateId);
            res.status(200).json({ success: true, message: 'Get applicant successfully.', result: returnCandidate });
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
            const interviewerId = decodedToken.userId;
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
            const { interviewLength, returnListInterviews } = await interviewer_service_1.interviewerService.getAllInterviews(interviewerId, page, limit);
            res.status(200).json({
                success: true, message: "Get list interview Successfully!", result: {
                    pageNumber: page,
                    totalPages: Math.ceil(interviewLength / limit),
                    limit: limit,
                    totalElements: interviewLength,
                    content: returnListInterviews
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
    getSingleInterview: async (req, res, next) => {
        try {
            const authHeader = req.get('Authorization');
            const accessToken = authHeader.split(' ')[1];
            const decodedToken = await (0, utils_1.verifyAccessToken)(accessToken);
            const interviewerId = decodedToken.userId;
            const interviewId = req.params.interviewId;
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                const error = new Error(errors.array()[0].msg);
                error.statusCode = 400;
                error.result = null;
                throw error;
            }
            const returnInterview = await interviewer_service_1.interviewerService.getSingleInterview(interviewerId, interviewId);
            res.status(200).json({ success: true, message: "Get interview Successfully!", result: returnInterview });
        }
        catch (err) {
            if (!err.statusCode) {
                err.statusCode = 500;
                err.result = null;
            }
            next(err);
        }
    },
    createQuestion: async (req, res, next) => {
        try {
            const authHeader = req.get('Authorization');
            const accessToken = authHeader.split(' ')[1];
            const decodedToken = await (0, utils_1.verifyAccessToken)(accessToken);
            const interviewerId = decodedToken.userId;
            const { content, type, skill, note } = req.body;
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                const error = new Error(errors.array()[0].msg);
                error.statusCode = 400;
                error.result = null;
                throw error;
            }
            const result = await interviewer_service_1.interviewerService.createQuestion(interviewerId, content, type, skill, note);
            res.status(200).json({ success: true, message: 'Create question successfully.', result: result });
        }
        catch (err) {
            if (!err.statusCode) {
                err.statusCode = 500;
                err.result = null;
            }
            next(err);
        }
    },
    getAllQuestions: async (req, res, next) => {
        try {
            const authHeader = req.get('Authorization');
            const accessToken = authHeader.split(' ')[1];
            const decodedToken = await (0, utils_1.verifyAccessToken)(accessToken);
            const interviewerId = decodedToken.userId;
            const { skill, type, content } = req.query;
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
            const { questionLength, returnListQuestions } = await interviewer_service_1.interviewerService.getAllQuestions(interviewerId, skill, type, content, page, limit);
            res.status(200).json({
                success: true, message: 'Get list questions successfully.', result: {
                    pageNumber: page,
                    totalPages: Math.ceil(questionLength / limit),
                    limit: limit,
                    totalElements: questionLength,
                    content: returnListQuestions
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
    getSingleQuestion: async (req, res, next) => {
        try {
            const authHeader = req.get('Authorization');
            const accessToken = authHeader.split(' ')[1];
            const decodedToken = await (0, utils_1.verifyAccessToken)(accessToken);
            const interviewerId = decodedToken.userId;
            const questionId = req.params.questionId;
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                const error = new Error(errors.array()[0].msg);
                error.statusCode = 400;
                error.result = null;
                throw error;
            }
            const returnQuestion = await interviewer_service_1.interviewerService.getSingleQuestion(interviewerId, questionId);
            res.status(200).json({ success: true, message: 'Get question successfully.', result: returnQuestion });
        }
        catch (err) {
            if (!err.statusCode) {
                err.statusCode = 500;
                err.result = null;
            }
            next(err);
        }
    },
    updateQuestion: async (req, res, next) => {
        try {
            const authHeader = req.get('Authorization');
            const accessToken = authHeader.split(' ')[1];
            const decodedToken = await (0, utils_1.verifyAccessToken)(accessToken);
            const interviewerId = decodedToken.userId;
            const questionId = req.params.questionId;
            const { content, type, skill, note } = req.body;
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                const error = new Error(errors.array()[0].msg);
                error.statusCode = 400;
                error.result = null;
                throw error;
            }
            await interviewer_service_1.interviewerService.updateQuestion(interviewerId, questionId, content, type, skill, note);
            res.status(200).json({ success: true, message: 'Update question successfully.', result: null });
        }
        catch (err) {
            if (!err.statusCode) {
                err.statusCode = 500;
                err.result = null;
            }
            next(err);
        }
    },
    deleteQuestion: async (req, res, next) => {
        try {
            const authHeader = req.get('Authorization');
            const accessToken = authHeader.split(' ')[1];
            const decodedToken = await (0, utils_1.verifyAccessToken)(accessToken);
            const interviewerId = decodedToken.userId;
            const questionId = req.params.questionId;
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                const error = new Error(errors.array()[0].msg);
                error.statusCode = 400;
                error.result = null;
                throw error;
            }
            await interviewer_service_1.interviewerService.deleteQuestion(interviewerId, questionId);
            res.status(200).json({ success: true, message: 'Delete question successfully.', result: null });
        }
        catch (err) {
            if (!err.statusCode) {
                err.statusCode = 500;
                err.result = null;
            }
            next(err);
        }
    },
    getSkillQuestion: async (req, res, next) => {
        try {
            const authHeader = req.get('Authorization');
            const accessToken = authHeader.split(' ')[1];
            const decodedToken = await (0, utils_1.verifyAccessToken)(accessToken);
            const interviewerId = decodedToken.userId;
            const returnSkills = await interviewer_service_1.interviewerService.getSkillQuestion(interviewerId);
            res.status(200).json({ success: true, message: 'Get question skills successfully.', result: returnSkills });
        }
        catch (err) {
            if (!err.statusCode) {
                err.statusCode = 500;
                err.result = null;
            }
            next(err);
        }
    },
    getTypeQuestion: async (req, res, next) => {
        try {
            const authHeader = req.get('Authorization');
            const accessToken = authHeader.split(' ')[1];
            const decodedToken = await (0, utils_1.verifyAccessToken)(accessToken);
            const interviewer = await user_1.User.findById(decodedToken.userId).populate('roleId');
            if (interviewer?.get('roleId.roleName') !== 'INTERVIEWER') {
                const error = new Error('UnAuthorized');
                error.statusCode = 401;
                error.result = null;
                throw error;
            }
            ;
            const returnType = utils_1.questionType;
            res.status(200).json({ success: true, message: 'Get question type successfully.', result: returnType });
        }
        catch (err) {
            if (!err.statusCode) {
                err.statusCode = 500;
                err.result = null;
            }
            next(err);
        }
    },
    getAssignQuestions: async (req, res, next) => {
        try {
            const authHeader = req.get('Authorization');
            const accessToken = authHeader.split(' ')[1];
            const decodedToken = await (0, utils_1.verifyAccessToken)(accessToken);
            const interviewerId = decodedToken.userId;
            const interviewId = req.params.interviewId;
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                const error = new Error(errors.array()[0].msg);
                error.statusCode = 400;
                error.result = [];
                throw error;
            }
            const returnQuestions = await interviewer_service_1.interviewerService.getAssignQuestions(interviewerId, interviewId);
            res.status(200).json({ success: true, message: 'Get assigned questions successfully.', result: returnQuestions });
        }
        catch (err) {
            if (!err.statusCode) {
                err.statusCode = 500;
                err.result = null;
            }
            next(err);
        }
    },
    assignQuestions: async (req, res, next) => {
        try {
            const authHeader = req.get('Authorization');
            const accessToken = authHeader.split(' ')[1];
            const decodedToken = await (0, utils_1.verifyAccessToken)(accessToken);
            const interviewerId = decodedToken.userId;
            const questions = req.body.questions;
            const interviewId = req.params.interviewId;
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                const error = new Error(errors.array()[0].msg);
                error.statusCode = 400;
                error.result = null;
                throw error;
            }
            await interviewer_service_1.interviewerService.assignQuestions(interviewerId, questions, interviewId);
            res.status(200).json({ success: true, message: 'Assign questions successfully.', result: null });
        }
        catch (err) {
            if (!err.statusCode) {
                err.statusCode = 500;
                err.result = null;
            }
            next(err);
        }
    },
    updateQuestions: async (req, res, next) => {
        try {
            const authHeader = req.get('Authorization');
            const accessToken = authHeader.split(' ')[1];
            const decodedToken = await (0, utils_1.verifyAccessToken)(accessToken);
            const interviewerId = decodedToken.userId;
            const questions = req.body.questions;
            const interviewId = req.params.interviewId;
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                const error = new Error(errors.array()[0].msg);
                error.statusCode = 400;
                error.result = null;
                throw error;
            }
            await interviewer_service_1.interviewerService.updateQuestions(interviewerId, questions, interviewId);
            res.status(200).json({ success: true, message: 'Update questions successfully.', result: null });
        }
        catch (err) {
            if (!err.statusCode) {
                err.statusCode = 500;
                err.result = null;
            }
            next(err);
        }
    },
    deleteAssignQuestion: async (req, res, next) => {
        try {
            const authHeader = req.get('Authorization');
            const accessToken = authHeader.split(' ')[1];
            const decodedToken = await (0, utils_1.verifyAccessToken)(accessToken);
            const interviewerId = decodedToken.userId;
            const questionId = req.params.questionId;
            const interviewId = req.params.interviewId;
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                const error = new Error(errors.array()[0].msg);
                error.statusCode = 400;
                error.result = null;
                throw error;
            }
            await interviewer_service_1.interviewerService.deleteAssignQuestion(interviewerId, questionId, interviewId);
            res.status(200).json({ success: true, message: 'Delete assign question successfully.', result: null });
        }
        catch (err) {
            if (!err.statusCode) {
                err.statusCode = 500;
                err.result = null;
            }
            next(err);
        }
    },
    submitTotalScore: async (req, res, next) => {
        try {
            const authHeader = req.get('Authorization');
            const accessToken = authHeader.split(' ')[1];
            const decodedToken = await (0, utils_1.verifyAccessToken)(accessToken);
            const interviewerId = decodedToken.userId;
            const interviewId = req.params.interviewId;
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                const error = new Error(errors.array()[0].msg);
                error.statusCode = 400;
                error.result = null;
                throw error;
            }
            await interviewer_service_1.interviewerService.submitTotalScore(interviewerId, interviewId);
            res.status(200).json({ success: true, message: 'Save score successfully.', result: null });
        }
        catch (err) {
            if (!err.statusCode) {
                err.statusCode = 500;
                err.result = null;
            }
            next(err);
        }
    },
    interviewerStatistics: async (req, res, next) => {
        try {
            const authHeader = req.get('Authorization');
            const accessToken = authHeader.split(' ')[1];
            const decodedToken = await (0, utils_1.verifyAccessToken)(accessToken);
            const interviewerId = decodedToken.userId;
            const { interviewNumber, contributedQuestionNumber, scoredInterviewNumber, incompleteInterviewNumber } = await interviewer_service_1.interviewerService.interviewerStatistics(interviewerId);
            res.status(200).json({
                success: true, message: 'Get statistics successfully.', result: {
                    interviewCount: interviewNumber,
                    contributedQuestionCount: contributedQuestionNumber,
                    scoredInterviewCount: scoredInterviewNumber,
                    incompleteInterviewCount: incompleteInterviewNumber
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
};
