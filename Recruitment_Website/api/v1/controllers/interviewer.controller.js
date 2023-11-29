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
exports.deleteAssignQuestion = exports.updateQuestions = exports.assignQuestions = exports.getAssignQuestions = exports.getTypeQuestion = exports.getSkillQuestion = exports.deleteQuestion = exports.updateQuestion = exports.getSingleQuestion = exports.getAllQuestions = exports.createQuestion = exports.getSingleInterview = exports.getAllInterviews = exports.getSingleApplicant = exports.getAllApplicants = exports.getInformation = exports.saveInformation = void 0;
const utils_1 = require("../utils");
const express_validator_1 = require("express-validator");
const user_1 = require("../models/user");
const interviewerService = __importStar(require("../services/interviewer.service"));
const saveInformation = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyToken)(accessToken);
        const interviewerId = decodedToken.userId;
        const { education, experience, certificate, project, skills } = req.body;
        await interviewerService.saveInformation(interviewerId, education, experience, certificate, project, skills);
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
        const interviewerId = decodedToken.userId;
        const result = await interviewerService.getInformation(interviewerId);
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
const getAllApplicants = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyToken)(accessToken);
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
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        next(err);
    }
};
exports.getAllApplicants = getAllApplicants;
const getSingleApplicant = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyToken)(accessToken);
        const interviewerId = decodedToken.userId;
        const candidateId = req.params.candidateId;
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            const error = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        const returnCandidate = await interviewerService.getSingleApplicant(interviewerId, candidateId);
        res.status(200).json({ success: true, message: 'Get applicant successfully.', result: returnCandidate });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        next(err);
    }
};
exports.getSingleApplicant = getSingleApplicant;
const getAllInterviews = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyToken)(accessToken);
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
const getSingleInterview = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyToken)(accessToken);
        const interviewerId = decodedToken.userId;
        const interviewId = req.params.interviewId;
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            const error = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        const returnInterview = await interviewerService.getSingleInterview(interviewerId, interviewId);
        res.status(200).json({ success: true, message: "Get interview Successfully!", result: returnInterview });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        next(err);
    }
};
exports.getSingleInterview = getSingleInterview;
const createQuestion = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyToken)(accessToken);
        const interviewerId = decodedToken.userId;
        const { content, type, skill, note } = req.body;
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            const error = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        const result = await interviewerService.createQuestion(interviewerId, content, type, skill, note);
        res.status(200).json({ success: true, message: 'Create question successfully.', result: result });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        next(err);
    }
};
exports.createQuestion = createQuestion;
const getAllQuestions = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyToken)(accessToken);
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
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        next(err);
    }
};
exports.getAllQuestions = getAllQuestions;
const getSingleQuestion = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyToken)(accessToken);
        const interviewerId = decodedToken.userId;
        const questionId = req.params.questionId;
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            const error = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        const returnQuestion = await interviewerService.getSingleQuestion(interviewerId, questionId);
        res.status(200).json({ success: true, message: 'Get question successfully.', result: returnQuestion });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        next(err);
    }
};
exports.getSingleQuestion = getSingleQuestion;
const updateQuestion = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyToken)(accessToken);
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
        await interviewerService.updateQuestion(interviewerId, questionId, content, type, skill, note);
        res.status(200).json({ success: true, message: 'Update question successfully.', result: null });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        next(err);
    }
};
exports.updateQuestion = updateQuestion;
const deleteQuestion = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyToken)(accessToken);
        const interviewerId = decodedToken.userId;
        const questionId = req.params.questionId;
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            const error = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        await interviewerService.deleteQuestion(interviewerId, questionId);
        res.status(200).json({ success: true, message: 'Delete question successfully.', result: null });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        next(err);
    }
};
exports.deleteQuestion = deleteQuestion;
const getSkillQuestion = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyToken)(accessToken);
        const interviewerId = decodedToken.userId;
        const returnSkills = await interviewerService.getSkillQuestion(interviewerId);
        res.status(200).json({ success: true, message: 'Get question skills successfully.', result: returnSkills });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        next(err);
    }
};
exports.getSkillQuestion = getSkillQuestion;
const getTypeQuestion = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyToken)(accessToken);
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
};
exports.getTypeQuestion = getTypeQuestion;
const getAssignQuestions = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyToken)(accessToken);
        const interviewerId = decodedToken.userId;
        const interviewId = req.params.interviewId;
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            const error = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        const returnQuestions = await interviewerService.getAssignQuestions(interviewerId, interviewId);
        res.status(200).json({ success: true, message: 'Get assigned questions successfully.', result: returnQuestions });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        next(err);
    }
};
exports.getAssignQuestions = getAssignQuestions;
const assignQuestions = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyToken)(accessToken);
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
        await interviewerService.assignQuestions(interviewerId, questions, interviewId);
        res.status(200).json({ success: true, message: 'Assign questions successfully.', result: null });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        next(err);
    }
};
exports.assignQuestions = assignQuestions;
const updateQuestions = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyToken)(accessToken);
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
        await interviewerService.updateQuestions(interviewerId, questions, interviewId);
        res.status(200).json({ success: true, message: 'Update questions successfully.', result: null });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        next(err);
    }
};
exports.updateQuestions = updateQuestions;
const deleteAssignQuestion = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyToken)(accessToken);
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
        await interviewerService.deleteAssignQuestion(interviewerId, questionId, interviewId);
        res.status(200).json({ success: true, message: 'Delete assign question successfully.', result: null });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        next(err);
    }
};
exports.deleteAssignQuestion = deleteAssignQuestion;
