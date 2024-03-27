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
exports.recruiterStatistics = exports.getInterviewsOfInterviewer = exports.getInterviewsOfCandidate = exports.getJobSuggestedCandidates = exports.updateCandidateState = exports.createMeeting = exports.getSingleApplicantJob = exports.getApplicantsJob = exports.getSingleApplicant = exports.getAllApplicants = exports.getSingleInterviewer = exports.getAllInterviewers = exports.deleteEvent = exports.updateEvent = exports.createEvent = exports.getSingleEvent = exports.getAllEvents = exports.deleteJob = exports.updateJob = exports.getSingleJob = exports.createJob = exports.getAllJobs = void 0;
const utils_1 = require("../utils");
const express_validator_1 = require("express-validator");
const recruiterService = __importStar(require("../services/recruiter.service"));
const getAllJobs = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyAccessToken)(accessToken);
        const recruiterId = decodedToken.userId;
        const { name, type, position, location, active } = req.query;
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
const createJob = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const { name, jobType, quantity, benefit, salaryRange, requirement, location, description, deadline, position, skillRequired } = req.body;
        const errors = (0, express_validator_1.validationResult)(req);
        const decodedToken = await (0, utils_1.verifyAccessToken)(accessToken);
        const recruiterId = decodedToken.userId;
        if (!errors.isEmpty()) {
            const error = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        await recruiterService.createJob(recruiterId, name, position, jobType, quantity, benefit, salaryRange, requirement, location, description, deadline, skillRequired);
        res.status(200).json({ success: true, message: "Tạo job thành công", result: null });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        next(err);
    }
};
exports.createJob = createJob;
const getSingleJob = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyAccessToken)(accessToken);
        const recruiterId = decodedToken.userId;
        const jobId = req.params.jobId;
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            const error = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        ;
        const returnJob = await recruiterService.getSingleJob(recruiterId, jobId);
        res.status(200).json({ sucess: true, message: 'Đã tìm thấy job', result: returnJob });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        next(err);
    }
};
exports.getSingleJob = getSingleJob;
const updateJob = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyAccessToken)(accessToken);
        const recruiterId = decodedToken.userId;
        const jobId = req.params.jobId;
        const { name, jobType, quantity, benefit, salaryRange, requirement, location, description, deadline, position, skillRequired } = req.body;
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            const error = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        ;
        await recruiterService.updateJob(recruiterId, jobId, name, position, jobType, quantity, benefit, salaryRange, requirement, location, description, deadline, skillRequired);
        res.status(200).json({ sucess: true, message: 'Update job thành công', result: null });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        next(err);
    }
};
exports.updateJob = updateJob;
const deleteJob = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyAccessToken)(accessToken);
        const recruiterId = decodedToken.userId;
        const jobId = req.params.jobId;
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            const error = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        ;
        await recruiterService.deleteJob(recruiterId, jobId);
        res.status(200).json({ sucess: true, message: 'Xóa job thành công', result: null });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        next(err);
    }
};
exports.deleteJob = deleteJob;
const getAllEvents = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyAccessToken)(accessToken);
        const recruiterId = decodedToken.userId;
        const name = req.query.name;
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
        const query = {
            authorId: recruiterId,
            isActive: req.query['active'] ? req.query['active'] : true
        };
        if (name) {
            query['name'] = new RegExp(name, 'i');
        }
        ;
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
const getSingleEvent = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyAccessToken)(accessToken);
        const recruiterId = decodedToken.userId;
        const eventId = req.params.eventId;
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            const error = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        const returnEvent = await recruiterService.getSingleEvent(recruiterId, eventId);
        res.status(200).json({ success: true, message: 'Get event successfully', result: returnEvent });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        next(err);
    }
};
exports.getSingleEvent = getSingleEvent;
const createEvent = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyAccessToken)(accessToken);
        const recruiterId = decodedToken.userId;
        const { title, name, description, time, location, deadline, startAt } = req.body;
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            const error = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        if (!req.files || !req.files.image) {
            const error = new Error('Không có tệp nào được tải lên!');
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        ;
        const image = req.files.image;
        if (image.mimetype !== 'image/jpg' && image.mimetype !== 'image/png' && image.mimetype !== 'image/jpeg') {
            const error = new Error('File ảnh chỉ được phép là jpg,png,jpeg');
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        ;
        await recruiterService.createEvent(recruiterId, image, title, name, description, time, location, deadline, startAt);
        res.status(200).json({ success: true, message: 'Thêm event thành công', result: null });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        next(err);
    }
};
exports.createEvent = createEvent;
const updateEvent = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyAccessToken)(accessToken);
        const recruiterId = decodedToken.userId;
        const eventId = req.params.eventId;
        const { title, name, description, time, location, deadline, startAt } = req.body;
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            const error = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        const image = req.files ? req.files.image : null;
        await recruiterService.updateEvent(recruiterId, eventId, image, title, name, description, time, location, deadline, startAt);
        res.status(200).json({ success: true, message: 'Update event thành công', result: null });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        next(err);
    }
};
exports.updateEvent = updateEvent;
const deleteEvent = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyAccessToken)(accessToken);
        const recruiterId = decodedToken.userId;
        const eventId = req.params.eventId;
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            const error = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        await recruiterService.deleteEvent(recruiterId, eventId);
        res.status(200).json({ success: true, message: 'Xóa event thành công', result: null });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        next(err);
    }
};
exports.deleteEvent = deleteEvent;
const getAllInterviewers = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyAccessToken)(accessToken);
        const recruiterId = decodedToken.userId;
        const { name, skill } = req.query;
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
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        next(err);
    }
};
exports.getAllInterviewers = getAllInterviewers;
const getSingleInterviewer = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyAccessToken)(accessToken);
        const recruiterId = decodedToken.userId;
        const interviewerId = req.params.interviewerId;
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            const error = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        const returnInterviewer = await recruiterService.getSingleInterviewer(recruiterId, interviewerId);
        res.status(200).json({ success: true, message: 'Get interviewer successfully', result: returnInterviewer });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        next(err);
    }
};
exports.getSingleInterviewer = getSingleInterviewer;
const getAllApplicants = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyAccessToken)(accessToken);
        const recruiterId = decodedToken.userId;
        const { name, skill } = req.query;
        const page = req.query.page ? +req.query.page : 1;
        const limit = req.query.limit ? +req.query.limit : 10;
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            const error = new Error(errors.array()[0].msg);
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
        const decodedToken = await (0, utils_1.verifyAccessToken)(accessToken);
        const recruiterId = decodedToken.userId;
        const applicantId = req.params.userId;
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            const error = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        const returnApplicant = await recruiterService.getSingleApplicant(recruiterId, applicantId);
        res.status(200).json({ success: true, message: 'Get applicant successfully', result: returnApplicant });
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
const getApplicantsJob = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyAccessToken)(accessToken);
        const recruiterId = decodedToken.userId;
        const jobId = req.params.jobId;
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
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        next(err);
    }
};
exports.getApplicantsJob = getApplicantsJob;
const getSingleApplicantJob = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyAccessToken)(accessToken);
        const recruiterId = decodedToken.userId;
        const { jobId, candidateId } = req.params;
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            const error = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = {
                content: []
            };
            throw error;
        }
        const returnApplicant = await recruiterService.getSingleApplicantJob(recruiterId, jobId, candidateId);
        res.status(200).json({ success: true, message: 'Get applicant successfully', result: returnApplicant });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        next(err);
    }
};
exports.getSingleApplicantJob = getSingleApplicantJob;
const createMeeting = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyAccessToken)(accessToken);
        const recruiterId = decodedToken.userId;
        const { candidateId, interviewersId, time, jobApplyId } = req.body;
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            const error = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = {
                content: []
            };
            throw error;
        }
        await recruiterService.createMeeting(recruiterId, candidateId, interviewersId, time, jobApplyId);
        res.status(200).json({ success: true, message: 'Create meeting successfully', result: null });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        next(err);
    }
};
exports.createMeeting = createMeeting;
const updateCandidateState = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyAccessToken)(accessToken);
        const recruiterId = decodedToken.userId;
        const { candidateId, jobId, state } = req.body;
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            const error = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        await recruiterService.updateCandidateState(recruiterId, candidateId, jobId, state);
        res.status(200).json({ success: true, message: 'Update state successfully', result: null });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        next(err);
    }
};
exports.updateCandidateState = updateCandidateState;
const getJobSuggestedCandidates = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyAccessToken)(accessToken);
        const recruiterId = decodedToken.userId;
        const jobId = req.params.jobId;
        const page = req.query.page ? +req.query.page : 1;
        const limit = req.query.limit ? +req.query.limit : 10;
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            const error = new Error(errors.array()[0].msg);
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
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        next(err);
    }
};
exports.getJobSuggestedCandidates = getJobSuggestedCandidates;
const getInterviewsOfCandidate = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyAccessToken)(accessToken);
        const recruiterId = decodedToken.userId;
        const candidateId = req.params.candidateId;
        const page = req.query.page ? +req.query.page : 1;
        const limit = req.query.limit ? +req.query.limit : 10;
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            const error = new Error(errors.array()[0].msg);
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
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        next(err);
    }
};
exports.getInterviewsOfCandidate = getInterviewsOfCandidate;
const getInterviewsOfInterviewer = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyAccessToken)(accessToken);
        const recruiterId = decodedToken.userId;
        const interviewerId = req.params.interviewerId;
        const page = req.query.page ? +req.query.page : 1;
        const limit = req.query.limit ? +req.query.limit : 10;
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            const error = new Error(errors.array()[0].msg);
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
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        next(err);
    }
};
exports.getInterviewsOfInterviewer = getInterviewsOfInterviewer;
const recruiterStatistics = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyAccessToken)(accessToken);
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
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        next(err);
    }
};
exports.recruiterStatistics = recruiterStatistics;
