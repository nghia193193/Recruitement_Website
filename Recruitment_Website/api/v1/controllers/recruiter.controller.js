"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recruiterController = void 0;
const utils_1 = require("../utils");
const express_validator_1 = require("express-validator");
const recruiter_service_1 = require("../services/recruiter.service");
exports.recruiterController = {
    getAllJobs: async (req, res, next) => {
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
            const { listjobs, jobLength } = await recruiter_service_1.recruiterService.getAllJobs(recruiterId, name, type, position, location, active, page, limit);
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
    },
    createJob: async (req, res, next) => {
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
            await recruiter_service_1.recruiterService.createJob(recruiterId, name, position, jobType, quantity, benefit, salaryRange, requirement, location, description, deadline, skillRequired);
            res.status(200).json({ success: true, message: "Tạo job thành công", result: null });
        }
        catch (err) {
            if (!err.statusCode) {
                err.statusCode = 500;
                err.result = null;
            }
            next(err);
        }
    },
    getSingleJob: async (req, res, next) => {
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
            const returnJob = await recruiter_service_1.recruiterService.getSingleJob(recruiterId, jobId);
            res.status(200).json({ sucess: true, message: 'Đã tìm thấy job', result: returnJob });
        }
        catch (err) {
            if (!err.statusCode) {
                err.statusCode = 500;
                err.result = null;
            }
            next(err);
        }
    },
    updateJob: async (req, res, next) => {
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
            await recruiter_service_1.recruiterService.updateJob(recruiterId, jobId, name, position, jobType, quantity, benefit, salaryRange, requirement, location, description, deadline, skillRequired);
            res.status(200).json({ sucess: true, message: 'Update job thành công', result: null });
        }
        catch (err) {
            if (!err.statusCode) {
                err.statusCode = 500;
                err.result = null;
            }
            next(err);
        }
    },
    deleteJob: async (req, res, next) => {
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
            await recruiter_service_1.recruiterService.deleteJob(recruiterId, jobId);
            res.status(200).json({ sucess: true, message: 'Xóa job thành công', result: null });
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
            const { listEvents, eventLenght } = await recruiter_service_1.recruiterService.getAllEvents(recruiterId, query, page, limit);
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
    },
    getSingleEvent: async (req, res, next) => {
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
            const returnEvent = await recruiter_service_1.recruiterService.getSingleEvent(recruiterId, eventId);
            res.status(200).json({ success: true, message: 'Get event successfully', result: returnEvent });
        }
        catch (err) {
            if (!err.statusCode) {
                err.statusCode = 500;
                err.result = null;
            }
            next(err);
        }
    },
    createEvent: async (req, res, next) => {
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
            await recruiter_service_1.recruiterService.createEvent(recruiterId, image, title, name, description, time, location, deadline, startAt);
            res.status(200).json({ success: true, message: 'Thêm event thành công', result: null });
        }
        catch (err) {
            if (!err.statusCode) {
                err.statusCode = 500;
                err.result = null;
            }
            next(err);
        }
    },
    updateEvent: async (req, res, next) => {
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
            await recruiter_service_1.recruiterService.updateEvent(recruiterId, eventId, image, title, name, description, time, location, deadline, startAt);
            res.status(200).json({ success: true, message: 'Update event thành công', result: null });
        }
        catch (err) {
            if (!err.statusCode) {
                err.statusCode = 500;
                err.result = null;
            }
            next(err);
        }
    },
    deleteEvent: async (req, res, next) => {
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
            await recruiter_service_1.recruiterService.deleteEvent(recruiterId, eventId);
            res.status(200).json({ success: true, message: 'Xóa event thành công', result: null });
        }
        catch (err) {
            if (!err.statusCode) {
                err.statusCode = 500;
                err.result = null;
            }
            next(err);
        }
    },
    getAllInterviewers: async (req, res, next) => {
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
            const { mappedInterviewers, interviewerLength } = await recruiter_service_1.recruiterService.getAllInterviewers(recruiterId, name, skill, page, limit);
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
    },
    getSingleInterviewer: async (req, res, next) => {
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
            const returnInterviewer = await recruiter_service_1.recruiterService.getSingleInterviewer(recruiterId, interviewerId);
            res.status(200).json({ success: true, message: 'Get interviewer successfully', result: returnInterviewer });
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
            const { applicantList, applicantLength } = await recruiter_service_1.recruiterService.getAllApplicants(recruiterId, name, skill, page, limit);
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
    },
    getSingleApplicant: async (req, res, next) => {
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
            const returnApplicant = await recruiter_service_1.recruiterService.getSingleApplicant(recruiterId, applicantId);
            res.status(200).json({ success: true, message: 'Get applicant successfully', result: returnApplicant });
        }
        catch (err) {
            if (!err.statusCode) {
                err.statusCode = 500;
                err.result = null;
            }
            next(err);
        }
    },
    getApplicantsJob: async (req, res, next) => {
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
            const { applicantList, applicantsJobLength } = await recruiter_service_1.recruiterService.getApplicantsJob(recruiterId, jobId, page, limit);
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
    },
    getSingleApplicantJob: async (req, res, next) => {
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
            const returnApplicant = await recruiter_service_1.recruiterService.getSingleApplicantJob(recruiterId, jobId, candidateId);
            res.status(200).json({ success: true, message: 'Get applicant successfully', result: returnApplicant });
        }
        catch (err) {
            if (!err.statusCode) {
                err.statusCode = 500;
                err.result = null;
            }
            next(err);
        }
    },
    createMeeting: async (req, res, next) => {
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
            await recruiter_service_1.recruiterService.createMeeting(recruiterId, candidateId, interviewersId, time, jobApplyId);
            res.status(200).json({ success: true, message: 'Create meeting successfully', result: null });
        }
        catch (err) {
            if (!err.statusCode) {
                err.statusCode = 500;
                err.result = null;
            }
            next(err);
        }
    },
    updateCandidateState: async (req, res, next) => {
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
            await recruiter_service_1.recruiterService.updateCandidateState(recruiterId, candidateId, jobId, state);
            res.status(200).json({ success: true, message: 'Update state successfully', result: null });
        }
        catch (err) {
            if (!err.statusCode) {
                err.statusCode = 500;
                err.result = null;
            }
            next(err);
        }
    },
    getJobSuggestedCandidates: async (req, res, next) => {
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
            const { sugggestedCandidateList, suggestedCandidateLength } = await recruiter_service_1.recruiterService.getJobSuggestedCandidates(recruiterId, jobId, page, limit);
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
    },
    getInterviewsOfCandidate: async (req, res, next) => {
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
            const { interviewList, interviewLength } = await recruiter_service_1.recruiterService.getInterviewsOfCandidate(recruiterId, candidateId, page, limit);
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
    },
    getInterviewsOfInterviewer: async (req, res, next) => {
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
            const { interviewList, interviewLength } = await recruiter_service_1.recruiterService.getInterviewsOfInterviewer(recruiterId, interviewerId, page, limit);
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
    },
    recruiterStatistics: async (req, res, next) => {
        try {
            const authHeader = req.get('Authorization');
            const accessToken = authHeader.split(' ')[1];
            const decodedToken = await (0, utils_1.verifyAccessToken)(accessToken);
            const recruiterId = decodedToken.userId;
            const { jobNumber, eventNumber, interviewNumber, candidatePassNumber } = await recruiter_service_1.recruiterService.recruiterStatistics(recruiterId);
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
    }
};
