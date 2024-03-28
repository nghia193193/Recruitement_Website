"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const recruiter_controller_1 = require("../controllers/recruiter.controller");
const express_validator_1 = require("express-validator");
const sanitize_html_1 = __importDefault(require("sanitize-html"));
const middleware_1 = require("../middleware");
const utils_1 = require("../utils");
const user_1 = require("../models/user");
const router = (0, express_1.Router)();
router.get('/jobs', middleware_1.isAuth, [
    (0, express_validator_1.query)('name').trim()
        .customSanitizer((value) => {
        if (value) {
            return (0, sanitize_html_1.default)(value);
        }
    }),
    (0, express_validator_1.query)('position').trim()
        .custom((value) => {
        if (value) {
            if (!utils_1.jobPosition.includes(value)) {
                throw new Error(`Failed to convert 'position' with value: '${value}'`);
            }
        }
        return true;
    }),
    (0, express_validator_1.query)('type').trim()
        .custom((value) => {
        if (value) {
            if (!utils_1.jobType.includes(value)) {
                throw new Error(`Failed to convert 'position' with value: '${value}'`);
            }
        }
        return true;
    }),
    (0, express_validator_1.query)('location').trim()
        .custom((value) => {
        if (value) {
            if (!utils_1.jobLocation.includes(value)) {
                throw new Error(`Failed to convert 'position' with value: '${value}'`);
            }
        }
        return true;
    }),
    (0, express_validator_1.query)('page').trim()
        .custom((value) => {
        if (value) {
            const regex = /^[0-9]+$/; // Chỉ cho phép số
            if (!regex.test(value)) {
                throw new Error('page không hợp lệ');
            }
            ;
            const intValue = parseInt(value, 10);
            if (isNaN(intValue) || intValue <= 0) {
                throw new Error('page phải là số nguyên lớn hơn 0');
            }
            return true;
        }
        return true;
    }),
    (0, express_validator_1.query)('limit').trim()
        .custom((value) => {
        if (value) {
            const regex = /^[0-9]+$/; // Chỉ cho phép số
            if (!regex.test(value)) {
                throw new Error('limit không hợp lệ');
            }
            ;
            const intValue = parseInt(value, 10);
            if (isNaN(intValue) || intValue <= 0) {
                throw new Error('limit phải là số nguyên lớn hơn 0');
            }
            return true;
        }
        return true;
    }),
], recruiter_controller_1.recruiterController.getAllJobs);
router.post('/job', middleware_1.isAuth, [
    (0, express_validator_1.body)('name').trim()
        .isLength({ min: 5, max: 200 }).withMessage('Tên công việc trong khoảng 5-200 ký tự')
        .customSanitizer((value) => {
        return (0, sanitize_html_1.default)(value);
    }),
    (0, express_validator_1.body)('jobType').trim()
        .notEmpty().withMessage('Vui lòng nhập jobType')
        .custom(async (value) => {
        if (!utils_1.jobType.includes(value)) {
            throw new Error(`Failed to convert 'position' with value: '${value}'`);
        }
        return true;
    }),
    (0, express_validator_1.body)('quantity').trim()
        .notEmpty().withMessage('Vui lòng nhập số lượng')
        .isInt({ min: 1 }).withMessage('Số lượng phải là số nguyên dương'),
    (0, express_validator_1.body)('benefit').trim()
        .isLength({ min: 5, max: 500 }).withMessage('Benefit trong khoảng 5-500 ký tự')
        .customSanitizer((value) => {
        return (0, sanitize_html_1.default)(value);
    }),
    (0, express_validator_1.body)('salaryRange').trim()
        .notEmpty().withMessage('Vui lòng điền mức lương')
        .customSanitizer((value) => {
        return (0, sanitize_html_1.default)(value);
    }),
    (0, express_validator_1.body)('requirement').trim()
        .notEmpty().withMessage('Vui lòng nhập requirement')
        .customSanitizer((value) => {
        return (0, sanitize_html_1.default)(value);
    }),
    (0, express_validator_1.body)('location').trim()
        .notEmpty().withMessage('Vui lòng chọn địa điểm')
        .custom(async (value) => {
        if (!utils_1.jobLocation.includes(value)) {
            throw new Error(`Failed to convert 'position' with value: '${value}'`);
        }
        return true;
    }),
    (0, express_validator_1.body)('description').trim()
        .notEmpty().withMessage('Vui lòng nhập description')
        .customSanitizer((value) => {
        return (0, sanitize_html_1.default)(value);
    }),
    (0, express_validator_1.body)('deadline').trim()
        .notEmpty().withMessage('Vui lòng nhập deadline')
        .isDate().withMessage('deadline không hợp lệ'),
    (0, express_validator_1.body)('position').trim()
        .notEmpty().withMessage('Vui lòng nhập position')
        .custom(async (value) => {
        if (!utils_1.jobPosition.includes(value)) {
            throw new Error(`Failed to convert 'position' with value: '${value}'`);
        }
        return true;
    }),
    (0, express_validator_1.body)('skillRequired')
        .isArray().withMessage('Skills không hợp lệ')
        .custom((value) => {
        const errors = [];
        for (const skill of value) {
            if (!utils_1.skills.includes(skill)) {
                errors.push(`Skill: '${skill}' không hợp lệ`);
            }
        }
        if (errors.length > 0) {
            throw new Error(errors[0]);
        }
        return true;
    })
], recruiter_controller_1.recruiterController.createJob);
router.get('/jobs/:jobId', middleware_1.isAuth, (0, express_validator_1.param)('jobId').trim().isMongoId().withMessage('Id không hợp lệ'), recruiter_controller_1.recruiterController.getSingleJob);
router.put('/jobs/:jobId', middleware_1.isAuth, [
    (0, express_validator_1.param)('jobId').trim().isMongoId().withMessage('Id không hợp lệ'),
    (0, express_validator_1.body)('name').trim()
        .isLength({ min: 5, max: 200 }).withMessage('Tên công việc trong khoảng 5-200 ký tự')
        .customSanitizer((value) => {
        return (0, sanitize_html_1.default)(value);
    }),
    (0, express_validator_1.body)('jobType').trim()
        .notEmpty().withMessage('Vui lòng nhập jobType')
        .custom((value) => {
        if (!utils_1.jobType.includes(value)) {
            throw new Error(`Failed to convert 'position' with value: '${value}'`);
        }
        return true;
    }),
    (0, express_validator_1.body)('quantity').trim()
        .notEmpty().withMessage('Vui lòng nhập số lượng')
        .isInt({ min: 1 }).withMessage('Số lượng phải là số nguyên dương'),
    (0, express_validator_1.body)('benefit').trim()
        .isLength({ min: 5, max: 500 }).withMessage('Benefit trong khoảng 5-500 ký tự')
        .customSanitizer((value) => {
        return (0, sanitize_html_1.default)(value);
    }),
    (0, express_validator_1.body)('salaryRange').trim()
        .notEmpty().withMessage('Vui lòng điền mức lương')
        .customSanitizer((value) => {
        return (0, sanitize_html_1.default)(value);
    }),
    (0, express_validator_1.body)('requirement').trim()
        .notEmpty().withMessage('Vui lòng nhập requirement')
        .customSanitizer((value) => {
        return (0, sanitize_html_1.default)(value);
    }),
    (0, express_validator_1.body)('location').trim()
        .notEmpty().withMessage('Vui lòng chọn địa điểm')
        .custom(async (value) => {
        if (!utils_1.jobLocation.includes(value)) {
            throw new Error(`Failed to convert 'position' with value: '${value}'`);
        }
        return true;
    }),
    (0, express_validator_1.body)('description').trim()
        .notEmpty().withMessage('Vui lòng nhập description')
        .customSanitizer((value) => {
        return (0, sanitize_html_1.default)(value);
    }),
    (0, express_validator_1.body)('deadline').trim()
        .notEmpty().withMessage('Vui lòng nhập deadline')
        .isISO8601().toDate().withMessage('deadline không hợp lệ'),
    (0, express_validator_1.body)('position').trim()
        .notEmpty().withMessage('Vui lòng nhập position')
        .custom(async (value) => {
        if (!utils_1.jobPosition.includes(value)) {
            throw new Error(`Failed to convert 'position' with value: '${value}'`);
        }
        return true;
    }),
    (0, express_validator_1.body)('skillRequired')
        .isArray().withMessage('Skills không hợp lệ')
        .custom((value) => {
        const errors = [];
        for (const skill of value) {
            if (!utils_1.skills.includes(skill)) {
                errors.push(`Skill: '${skill}' không hợp lệ`);
            }
        }
        if (errors.length > 0) {
            throw new Error(errors[0]);
        }
        return true;
    })
], recruiter_controller_1.recruiterController.updateJob);
router.delete('/jobs/:jobId', middleware_1.isAuth, (0, express_validator_1.param)('jobId').trim().isMongoId().withMessage('Id không hợp lệ'), recruiter_controller_1.recruiterController.deleteJob);
router.get('/events', middleware_1.isAuth, [
    (0, express_validator_1.query)('name').trim()
        .customSanitizer((value) => {
        if (value) {
            const sanitizedValue = (0, sanitize_html_1.default)(value);
            return sanitizedValue;
        }
    }),
    (0, express_validator_1.query)('page').trim()
        .custom((value) => {
        if (value) {
            const regex = /^[0-9]+$/; // Chỉ cho phép số
            if (!regex.test(value)) {
                throw new Error('page không hợp lệ');
            }
            ;
            const intValue = parseInt(value, 10);
            if (isNaN(intValue) || intValue <= 0) {
                throw new Error('page phải là số nguyên lớn hơn 0');
            }
        }
        return true;
    }),
    (0, express_validator_1.query)('limit').trim()
        .custom((value) => {
        if (value) {
            const regex = /^[0-9]+$/; // Chỉ cho phép số
            if (!regex.test(value)) {
                throw new Error('limit không hợp lệ');
            }
            ;
            const intValue = parseInt(value, 10);
            if (isNaN(intValue) || intValue <= 0) {
                throw new Error('limit phải là số nguyên lớn hơn 0');
            }
        }
        return true;
    }),
], recruiter_controller_1.recruiterController.getAllEvents);
router.get('/events/:eventId', middleware_1.isAuth, (0, express_validator_1.param)('eventId').trim().isMongoId().withMessage('Id không hợp lệ'), recruiter_controller_1.recruiterController.getSingleEvent);
router.post('/events', middleware_1.isAuth, [
    (0, express_validator_1.body)('title').trim()
        .notEmpty().withMessage('Vui lòng nhập title')
        .customSanitizer((value) => {
        return (0, sanitize_html_1.default)(value);
    }),
    (0, express_validator_1.body)('name').trim()
        .notEmpty().withMessage('Vui lòng nhập tên')
        .customSanitizer((value) => {
        return (0, sanitize_html_1.default)(value);
    }),
    (0, express_validator_1.body)('description').trim()
        .notEmpty().withMessage('Vui lòng nhập description')
        .customSanitizer((value) => {
        return (0, sanitize_html_1.default)(value);
    }),
    (0, express_validator_1.body)('time').trim()
        .notEmpty().withMessage('Vui lòng nhập thời gian')
        .custom((value) => {
        if (!(0, utils_1.isValidTimeFormat)(value)) {
            throw new Error('Thời gian không hợp lệ.');
        }
        return true;
    }),
    (0, express_validator_1.body)('location').trim()
        .notEmpty().withMessage('Vui lòng nhập địa điểm')
        .custom((value) => {
        if (!utils_1.jobLocation.includes(value)) {
            throw new Error(`Failed to convert 'position' with value: '${value}'`);
        }
        return true;
    }),
    (0, express_validator_1.body)('deadline').trim()
        .notEmpty().withMessage('Vui lòng nhập deadline')
        .isISO8601().toDate().withMessage('Deadline không hợp lệ'),
    (0, express_validator_1.body)('startAt').trim()
        .notEmpty().withMessage('Vui lòng nhập thời gian bắt đầu')
        .isISO8601().toDate().withMessage('Thời gian bắt đầu không hợp lệ')
], recruiter_controller_1.recruiterController.createEvent);
router.put('/events/:eventId', middleware_1.isAuth, [
    (0, express_validator_1.param)('eventId').trim().isMongoId().withMessage('Id không hợp lệ'),
    (0, express_validator_1.body)('title').trim()
        .notEmpty().withMessage('Vui lòng nhập title')
        .customSanitizer((value) => {
        return (0, sanitize_html_1.default)(value);
    }),
    (0, express_validator_1.body)('name').trim()
        .notEmpty().withMessage('Vui lòng nhập tên')
        .customSanitizer((value) => {
        return (0, sanitize_html_1.default)(value);
    }),
    (0, express_validator_1.body)('description').trim()
        .notEmpty().withMessage('Vui lòng nhập description')
        .customSanitizer((value) => {
        return (0, sanitize_html_1.default)(value);
    }),
    (0, express_validator_1.body)('time').trim()
        .notEmpty().withMessage('Vui lòng nhập thời gian')
        .custom((value) => {
        if (!(0, utils_1.isValidTimeFormat)(value)) {
            throw new Error('Thời gian không hợp lệ.');
        }
        return true;
    }),
    (0, express_validator_1.body)('location').trim()
        .notEmpty().withMessage('Vui lòng nhập địa điểm')
        .custom((value) => {
        if (!utils_1.jobLocation.includes(value)) {
            throw new Error(`Failed to convert 'position' with value: '${value}'`);
        }
        return true;
    }),
    (0, express_validator_1.body)('deadline').trim()
        .notEmpty().withMessage('Vui lòng nhập deadline')
        .isISO8601().toDate().withMessage('Deadline không hợp lệ'),
    (0, express_validator_1.body)('startAt').trim()
        .notEmpty().withMessage('Vui lòng nhập thời gian bắt đầu')
        .isISO8601().toDate().withMessage('Thời gian bắt đầu không hợp lệ')
], recruiter_controller_1.recruiterController.updateEvent);
router.delete('/events/:eventId', middleware_1.isAuth, (0, express_validator_1.param)('eventId').trim().isMongoId().withMessage('Id không hợp lệ'), recruiter_controller_1.recruiterController.deleteEvent);
router.get('/interviewers', middleware_1.isAuth, [
    (0, express_validator_1.query)('name').trim()
        .custom((value) => {
        if (value) {
            const regex = /^[\p{L} ]+$/u;
            if (!regex.test(value)) {
                throw new Error('Tên không được chứa ký tự đặc biệt trừ dấu cách');
            }
            ;
            return true;
        }
        return true;
    }),
    (0, express_validator_1.query)('skill').trim()
        .custom((value) => {
        if (value) {
            if (!utils_1.skills.includes(value)) {
                throw new Error(`Skill: '${value}' không hợp lệ`);
            }
        }
        return true;
    })
], recruiter_controller_1.recruiterController.getAllInterviewers);
router.get('/interviewers/:interviewerId', middleware_1.isAuth, [
    (0, express_validator_1.param)('interviewerId').trim().isMongoId().withMessage('Id không hợp lệ')
], recruiter_controller_1.recruiterController.getSingleInterviewer);
router.get('/applied-candidates', middleware_1.isAuth, [
    (0, express_validator_1.query)('name').trim()
        .custom((value) => {
        if (value) {
            const regex = /^[\p{L} ]+$/u;
            if (!regex.test(value)) {
                throw new Error('Tên không được chứa ký tự đặc biệt trừ dấu cách');
            }
            ;
            return true;
        }
        return true;
    }),
    (0, express_validator_1.query)('skill').trim()
        .custom((value) => {
        if (value) {
            if (!utils_1.skills.includes(value)) {
                throw new Error(`Skill: '${value}' không hợp lệ`);
            }
        }
        return true;
    }),
    (0, express_validator_1.query)('page').trim()
        .custom((value) => {
        if (value) {
            const regex = /^[0-9]+$/; // Chỉ cho phép số
            if (!regex.test(value)) {
                throw new Error('page không hợp lệ');
            }
            ;
            const intValue = parseInt(value, 10);
            if (isNaN(intValue) || intValue <= 0) {
                throw new Error('page phải là số nguyên lớn hơn 0');
            }
        }
        return true;
    }),
    (0, express_validator_1.query)('limit').trim()
        .custom((value) => {
        if (value) {
            const regex = /^[0-9]+$/; // Chỉ cho phép số
            if (!regex.test(value)) {
                throw new Error('limit không hợp lệ');
            }
            ;
            const intValue = parseInt(value, 10);
            if (isNaN(intValue) || intValue <= 0) {
                throw new Error('limit phải là số nguyên lớn hơn 0');
            }
        }
        return true;
    }),
], recruiter_controller_1.recruiterController.getAllApplicants);
router.get('/applied-candidates/:userId', middleware_1.isAuth, [
    (0, express_validator_1.param)('userId').trim().isMongoId().withMessage('Id không hợp lệ')
], recruiter_controller_1.recruiterController.getSingleApplicant);
router.get('/jobs/:jobId/candidates', middleware_1.isAuth, [
    (0, express_validator_1.param)('jobId').trim().isMongoId().withMessage('Id không hợp lệ'),
    (0, express_validator_1.query)('page').trim()
        .custom((value) => {
        if (value) {
            const regex = /^[0-9]+$/; // Chỉ cho phép số
            if (!regex.test(value)) {
                throw new Error('page không hợp lệ');
            }
            ;
            const intValue = parseInt(value, 10);
            if (isNaN(intValue) || intValue <= 0) {
                throw new Error('page phải là số nguyên lớn hơn 0');
            }
        }
        return true;
    }),
    (0, express_validator_1.query)('limit').trim()
        .custom((value) => {
        if (value) {
            const regex = /^[0-9]+$/; // Chỉ cho phép số
            if (!regex.test(value)) {
                throw new Error('limit không hợp lệ');
            }
            ;
            const intValue = parseInt(value, 10);
            if (isNaN(intValue) || intValue <= 0) {
                throw new Error('limit phải là số nguyên lớn hơn 0');
            }
        }
        return true;
    }),
], recruiter_controller_1.recruiterController.getApplicantsJob);
router.get('/jobs/:jobId/candidates/:candidateId', middleware_1.isAuth, [
    (0, express_validator_1.param)('jobId').trim().isMongoId().withMessage('jobId không hợp lệ'),
    (0, express_validator_1.param)('candidateId').trim().isMongoId().withMessage('candidateId không hợp lệ')
], recruiter_controller_1.recruiterController.getSingleApplicantJob);
router.post('/interviews', middleware_1.isAuth, [
    (0, express_validator_1.body)('candidateId').trim().isMongoId().withMessage('candidateId không hợp lệ'),
    (0, express_validator_1.body)('jobApplyId').trim().isMongoId().withMessage('jobApplyId không hợp lệ'),
    (0, express_validator_1.body)('interviewersId').trim()
        .custom(async (value) => {
        for (let interviewerId of value) {
            const interviewer = await user_1.User.findById(interviewerId).populate('roleId');
            if (!interviewer || !(interviewer.get('roleId.roleName') === "INTERVIEWER")) {
                throw new Error(`InterviewerId: '${interviewerId}' không hợp lệ hoặc không có quyền`);
            }
        }
        return true;
    }),
    (0, express_validator_1.body)('time').trim()
        .isISO8601().toDate().withMessage('Thời gian không hợp lệ')
], recruiter_controller_1.recruiterController.createMeeting);
router.put('/candidates/state', middleware_1.isAuth, [
    (0, express_validator_1.body)('candidateId').trim().isMongoId().withMessage('candidateId không hợp lệ'),
    (0, express_validator_1.body)('jobId').trim().isMongoId().withMessage('candidateId không hợp lệ'),
    (0, express_validator_1.body)('state').trim()
        .custom((value) => {
        if (!utils_1.applyStatus.includes(value)) {
            throw new Error(`State: '${value}' không hợp lệ`);
        }
        return true;
    })
], recruiter_controller_1.recruiterController.updateCandidateState);
router.get('/jobs/:jobId/suggested-user', middleware_1.isAuth, [
    (0, express_validator_1.param)('jobId').trim().isMongoId().withMessage('jobId không hợp lệ'),
], recruiter_controller_1.recruiterController.getJobSuggestedCandidates);
router.get('/candidates/:candidateId/interviews', middleware_1.isAuth, [
    (0, express_validator_1.param)('candidateId').trim().isMongoId().withMessage('candidateId không hợp lệ'),
    (0, express_validator_1.query)('page').trim()
        .custom((value) => {
        if (value) {
            const regex = /^[0-9]+$/; // Chỉ cho phép số
            if (!regex.test(value)) {
                throw new Error('page không hợp lệ');
            }
            ;
            const intValue = parseInt(value, 10);
            if (isNaN(intValue) || intValue <= 0) {
                throw new Error('page phải là số nguyên lớn hơn 0');
            }
        }
        return true;
    }),
    (0, express_validator_1.query)('limit').trim()
        .custom((value) => {
        if (value) {
            const regex = /^[0-9]+$/; // Chỉ cho phép số
            if (!regex.test(value)) {
                throw new Error('limit không hợp lệ');
            }
            ;
            const intValue = parseInt(value, 10);
            if (isNaN(intValue) || intValue <= 0) {
                throw new Error('limit phải là số nguyên lớn hơn 0');
            }
        }
        return true;
    }),
], recruiter_controller_1.recruiterController.getInterviewsOfCandidate);
router.get('/interviewers/:interviewerId/interviews', middleware_1.isAuth, [
    (0, express_validator_1.param)('interviewerId').trim().isMongoId().withMessage('interviewerId không hợp lệ'),
    (0, express_validator_1.query)('page').trim()
        .custom((value) => {
        if (value) {
            const regex = /^[0-9]+$/;
            if (!regex.test(value)) {
                throw new Error('page không hợp lệ');
            }
            ;
            const intValue = parseInt(value, 10);
            if (isNaN(intValue) || intValue <= 0) {
                throw new Error('page phải là số nguyên lớn hơn 0');
            }
        }
        return true;
    }),
    (0, express_validator_1.query)('limit').trim()
        .custom((value) => {
        if (value) {
            const regex = /^[0-9]+$/;
            if (!regex.test(value)) {
                throw new Error('limit không hợp lệ');
            }
            ;
            const intValue = parseInt(value, 10);
            if (isNaN(intValue) || intValue <= 0) {
                throw new Error('limit phải là số nguyên lớn hơn 0');
            }
        }
        return true;
    }),
], recruiter_controller_1.recruiterController.getInterviewsOfInterviewer);
router.get('/statistics', middleware_1.isAuth, recruiter_controller_1.recruiterController.recruiterStatistics);
exports.default = router;
