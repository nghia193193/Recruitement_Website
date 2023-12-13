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
const express_1 = require("express");
const recruiterController = __importStar(require("../controllers/recruiter.controller"));
const express_validator_1 = require("express-validator");
const jobPosition_1 = require("../models/jobPosition");
const jobType_1 = require("../models/jobType");
const jobLocation_1 = require("../models/jobLocation");
const skill_1 = require("../models/skill");
const middleware_1 = require("../middleware");
const utils_1 = require("../utils");
const user_1 = require("../models/user");
const router = (0, express_1.Router)();
router.get('/jobs', middleware_1.isAuth, [
    (0, express_validator_1.query)('name').trim()
        .custom((value, { req }) => {
        if (value) {
            const regex = /^[\p{L} 0-9#+]+$/u;
            if (!regex.test(value)) {
                throw new Error('Tên không được chứa ký tự đặc biệt trừ dấu cách, #+');
            }
            ;
            return true;
        }
        return true;
    }),
    (0, express_validator_1.query)('position').trim()
        .custom((value, { req }) => {
        if (value) {
            return jobPosition_1.JobPosition.findOne({ name: value })
                .then(pos => {
                if (!pos) {
                    return Promise.reject(`Failed to convert 'position' with value: '${value}'`);
                }
                return true;
            });
        }
        return true;
    }),
    (0, express_validator_1.query)('type').trim()
        .custom((value, { req }) => {
        if (value) {
            return jobType_1.JobType.findOne({ name: value })
                .then(type => {
                if (!type) {
                    return Promise.reject(`Failed to convert 'type' with value: '${value}'`);
                }
                return true;
            });
        }
        return true;
    }),
    (0, express_validator_1.query)('location').trim()
        .custom((value, { req }) => {
        if (value) {
            return jobLocation_1.JobLocation.findOne({ name: value })
                .then(loc => {
                if (!loc) {
                    return Promise.reject(`Failed to convert 'location' with value: '${value}'`);
                }
                return true;
            });
        }
        return true;
    }),
    (0, express_validator_1.query)('page').trim()
        .custom((value, { req }) => {
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
        .custom((value, { req }) => {
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
], recruiterController.GetAllJobs);
router.post('/job', middleware_1.isAuth, [
    (0, express_validator_1.body)('name').trim()
        .isLength({ min: 5, max: 50 }).withMessage('Tên công việc trong khoảng 5-50 ký tự')
        .custom((value, { req }) => {
        const regex = /^[\p{L} ,\/#0-9]+$/u;
        if (!regex.test(value)) {
            throw new Error('Tên công việc không được chứa ký tự đặc biệt trừ dấu cách');
        }
        ;
        return true;
    }),
    (0, express_validator_1.body)('jobType').trim()
        .notEmpty().withMessage('Vui lòng nhập jobType')
        .custom(async (value, { req }) => {
        const type = await jobType_1.JobType.findOne({ name: value });
        if (!type) {
            return Promise.reject(`Failed to convert 'type' with value: '${value}'`);
        }
        return true;
    }),
    (0, express_validator_1.body)('quantity').trim()
        .notEmpty().withMessage('Vui lòng nhập số lượng')
        .isInt({ min: 1 }).withMessage('Số lượng phải là số nguyên dương'),
    (0, express_validator_1.body)('benefit').trim()
        .isLength({ min: 5, max: 200 }).withMessage('Benefit trong khoảng 5-200 ký tự')
        .custom((value, { req }) => {
        const regex = /^[\p{L} .,\/:0-9]+$/u;
        if (!regex.test(value)) {
            throw new Error('Benefit không được chứa ký tự đặc biệt trừ dấu cách .,/:');
        }
        ;
        return true;
    }),
    (0, express_validator_1.body)('salaryRange').trim()
        .notEmpty().withMessage('Vui lòng điền mức lương')
        .custom((value, { req }) => {
        const regex = /^[A-Za-z0-9\s$-]+$/;
        if (!regex.test(value)) {
            throw new Error('Salary Range không được chứa ký tự đặc biệt trừ dấu cách $-');
        }
        ;
        return true;
    }),
    (0, express_validator_1.body)('requirement').trim()
        .isLength({ min: 5, max: 200 }).withMessage('Requirement trong khoảng 5-200 ký tự')
        .custom((value, { req }) => {
        const regex = /^[\p{L} .,\/:0-9]+$/u;
        if (!regex.test(value)) {
            throw new Error('Requirement không được chứa ký tự đặc biệt trừ dấu cách .,/:');
        }
        ;
        return true;
    }),
    (0, express_validator_1.body)('location').trim()
        .notEmpty().withMessage('Vui lòng chọn địa điểm')
        .custom(async (value, { req }) => {
        const location = await jobLocation_1.JobLocation.findOne({ name: value });
        if (!location) {
            throw new Error(`Failed to convert 'location' with value: '${value}'`);
        }
        return true;
    }),
    (0, express_validator_1.body)('description').trim()
        .notEmpty().withMessage('Vui lòng nhập description')
        .custom((value, { req }) => {
        const regex = /^[\p{L} .,\/:0-9]+$/u;
        if (!regex.test(value)) {
            throw new Error('Description không được chứa ký tự đặc biệt trừ dấu cách .,/:');
        }
        ;
        return true;
    }),
    (0, express_validator_1.body)('deadline').trim()
        .notEmpty().withMessage('Vui lòng nhập deadline')
        .isDate().withMessage('deadline không hợp lệ'),
    (0, express_validator_1.body)('position').trim()
        .notEmpty().withMessage('Vui lòng nhập position')
        .custom(async (value, { req }) => {
        const pos = await jobPosition_1.JobPosition.findOne({ name: value });
        if (!pos) {
            throw new Error(`Failed to convert 'position' with value: '${value}'`);
        }
        return true;
    }),
    (0, express_validator_1.body)('skillRequired')
        .isArray().withMessage('Skills không hợp lệ')
        .custom(async (value, { req }) => {
        const errors = [];
        for (const skill of value) {
            const s = await skill_1.Skill.findOne({ name: skill });
            if (!s) {
                errors.push(`Skill: '${skill}' không hợp lệ`);
            }
        }
        if (errors.length > 0) {
            throw new Error(errors[0]);
        }
        return true;
    })
], recruiterController.CreateJob);
router.get('/jobs/:jobId', middleware_1.isAuth, (0, express_validator_1.param)('jobId').trim().isMongoId().withMessage('Id không hợp lệ'), recruiterController.GetSingleJob);
router.put('/jobs/:jobId', middleware_1.isAuth, [
    (0, express_validator_1.param)('jobId').trim().isMongoId().withMessage('Id không hợp lệ'),
    (0, express_validator_1.body)('name').trim()
        .isLength({ min: 5, max: 50 }).withMessage('Tên công việc trong khoảng 5-50 ký tự')
        .custom((value, { req }) => {
        const regex = /^[\p{L} ,\/0-9]+$/u;
        if (!regex.test(value)) {
            throw new Error('Tên công việc không được chứa ký tự đặc biệt trừ dấu cách');
        }
        ;
        return true;
    }),
    (0, express_validator_1.body)('jobType').trim()
        .notEmpty().withMessage('Vui lòng nhập jobType')
        .custom(async (value, { req }) => {
        const type = await jobType_1.JobType.findOne({ name: value });
        if (!type) {
            return Promise.reject(`Failed to convert 'type' with value: '${value}'`);
        }
        return true;
    }),
    (0, express_validator_1.body)('quantity').trim()
        .notEmpty().withMessage('Vui lòng nhập số lượng')
        .isInt({ min: 1 }).withMessage('Số lượng phải là số nguyên dương'),
    (0, express_validator_1.body)('benefit').trim()
        .isLength({ min: 5, max: 200 }).withMessage('Benefit trong khoảng 5-200 ký tự')
        .custom((value, { req }) => {
        const regex = /^[\p{L} .,\/:0-9]+$/u;
        if (!regex.test(value)) {
            throw new Error('Benefit không được chứa ký tự đặc biệt trừ dấu cách .,/:');
        }
        ;
        return true;
    }),
    (0, express_validator_1.body)('salaryRange').trim()
        .notEmpty().withMessage('Vui lòng điền mức lương')
        .custom((value, { req }) => {
        const regex = /^[A-Za-z0-9\s$-]+$/;
        if (!regex.test(value)) {
            throw new Error('Salary Range không được chứa ký tự đặc biệt trừ dấu cách $-');
        }
        ;
        return true;
    }),
    (0, express_validator_1.body)('requirement').trim()
        .isLength({ min: 5, max: 200 }).withMessage('Requirement trong khoảng 5-200 ký tự')
        .custom((value, { req }) => {
        const regex = /^[\p{L} .,\/:0-9]+$/u;
        if (!regex.test(value)) {
            throw new Error('Requirement không được chứa ký tự đặc biệt trừ dấu cách .,/:');
        }
        ;
        return true;
    }),
    (0, express_validator_1.body)('location').trim()
        .notEmpty().withMessage('Vui lòng chọn địa điểm')
        .custom(async (value, { req }) => {
        const location = await jobLocation_1.JobLocation.findOne({ name: value });
        if (!location) {
            throw new Error(`Failed to convert 'location' with value: '${value}'`);
        }
        return true;
    }),
    (0, express_validator_1.body)('description').trim()
        .notEmpty().withMessage('Vui lòng nhập description')
        .custom((value, { req }) => {
        const regex = /^[\p{L} .,\/:0-9]+$/u;
        if (!regex.test(value)) {
            throw new Error('Description không được chứa ký tự đặc biệt trừ dấu cách .,/:');
        }
        ;
        return true;
    }),
    (0, express_validator_1.body)('deadline').trim()
        .notEmpty().withMessage('Vui lòng nhập deadline')
        .isISO8601().toDate().withMessage('deadline không hợp lệ'),
    (0, express_validator_1.body)('position').trim()
        .notEmpty().withMessage('Vui lòng nhập position')
        .custom(async (value, { req }) => {
        const pos = await jobPosition_1.JobPosition.findOne({ name: value });
        if (!pos) {
            throw new Error(`Failed to convert 'position' with value: '${value}'`);
        }
        return true;
    }),
    (0, express_validator_1.body)('skillRequired')
        .isArray().withMessage('Skills không hợp lệ')
        .custom(async (value, { req }) => {
        const errors = [];
        for (const skill of value) {
            const s = await skill_1.Skill.findOne({ name: skill });
            if (!s) {
                errors.push(`Skill: '${skill}' không hợp lệ`);
            }
        }
        if (errors.length > 0) {
            throw new Error(errors[0]);
        }
        return true;
    })
], recruiterController.UpdateJob);
router.delete('/jobs/:jobId', middleware_1.isAuth, (0, express_validator_1.param)('jobId').trim().isMongoId().withMessage('Id không hợp lệ'), recruiterController.DeleteJob);
router.get('/events', middleware_1.isAuth, [
    (0, express_validator_1.query)('name').trim()
        .custom((value, { req }) => {
        if (value) {
            const regex = /^[\p{L} 0-9]+$/u;
            if (!regex.test(value)) {
                throw new Error('Tên không được chứa ký tự đặc biệt trừ dấu cách');
            }
            ;
            return true;
        }
        return true;
    }),
    (0, express_validator_1.query)('page').trim()
        .custom((value, { req }) => {
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
        .custom((value, { req }) => {
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
], recruiterController.GetAllEvents);
router.get('/events/:eventId', middleware_1.isAuth, (0, express_validator_1.param)('eventId').trim().isMongoId().withMessage('Id không hợp lệ'), recruiterController.GetSingleEvent);
router.post('/events', middleware_1.isAuth, [
    (0, express_validator_1.body)('title').trim()
        .notEmpty().withMessage('Vui lòng nhập title')
        .custom((value, { req }) => {
        const regex = /^[\p{L} ,\/0-9]+$/u;
        if (!regex.test(value)) {
            throw new Error('Title không được chứa ký tự đặc biệt trừ dấu cách ,/:');
        }
        ;
        return true;
    }),
    (0, express_validator_1.body)('name').trim()
        .notEmpty().withMessage('Vui lòng nhập tên')
        .custom((value, { req }) => {
        const regex = /^[\p{L} ,\/0-9]+$/u;
        if (!regex.test(value)) {
            throw new Error('Tên không được chứa ký tự đặc biệt trừ dấu cách ,/:');
        }
        ;
        return true;
    }),
    (0, express_validator_1.body)('description').trim()
        .notEmpty().withMessage('Vui lòng nhập description')
        .custom((value, { req }) => {
        const regex = /^[\p{L} .,\/:0-9]+$/u;
        if (!regex.test(value)) {
            throw new Error('Description không được chứa ký tự đặc biệt trừ dấu cách .,/:');
        }
        ;
        return true;
    }),
    (0, express_validator_1.body)('time').trim()
        .notEmpty().withMessage('Vui lòng nhập thời gian')
        .custom((value, { req }) => {
        if (!(0, utils_1.isValidTimeFormat)(value)) {
            throw new Error('Thời gian không hợp lệ.');
        }
        return true;
    }),
    (0, express_validator_1.body)('location').trim()
        .notEmpty().withMessage('Vui lòng nhập địa điểm')
        .custom((value, { req }) => {
        return jobLocation_1.JobLocation.findOne({ name: value })
            .then(job => {
            if (!job) {
                return Promise.reject(`Failed to convert 'location' with value: '${value}'`);
            }
            return true;
        });
    }),
    (0, express_validator_1.body)('deadline').trim()
        .notEmpty().withMessage('Vui lòng nhập deadline')
        .isISO8601().toDate().withMessage('Deadline không hợp lệ'),
    (0, express_validator_1.body)('startAt').trim()
        .notEmpty().withMessage('Vui lòng nhập thời gian bắt đầu')
        .isISO8601().toDate().withMessage('Thời gian bắt đầu không hợp lệ')
], recruiterController.CreateEvent);
router.put('/events/:eventId', middleware_1.isAuth, [
    (0, express_validator_1.param)('eventId').trim().isMongoId().withMessage('Id không hợp lệ'),
    (0, express_validator_1.body)('title').trim()
        .notEmpty().withMessage('Vui lòng nhập title')
        .custom((value, { req }) => {
        const regex = /^[\p{L} .,\/:0-9]+$/u;
        if (!regex.test(value)) {
            throw new Error('Title không được chứa ký tự đặc biệt trừ dấu cách .,/:');
        }
        ;
        return true;
    }),
    (0, express_validator_1.body)('name').trim()
        .notEmpty().withMessage('Vui lòng nhập tên')
        .custom((value, { req }) => {
        const regex = /^[\p{L} .,\/:0-9]+$/u;
        if (!regex.test(value)) {
            throw new Error('Tên không được chứa ký tự đặc biệt trừ dấu cách .,/:');
        }
        ;
        return true;
    }),
    (0, express_validator_1.body)('description').trim()
        .notEmpty().withMessage('Vui lòng nhập description')
        .custom((value, { req }) => {
        const regex = /^[\p{L} .,\/:0-9]+$/u;
        if (!regex.test(value)) {
            throw new Error('Description không được chứa ký tự đặc biệt trừ dấu cách .,/:');
        }
        ;
        return true;
    }),
    (0, express_validator_1.body)('time').trim()
        .notEmpty().withMessage('Vui lòng nhập thời gian')
        .custom((value, { req }) => {
        if (!(0, utils_1.isValidTimeFormat)(value)) {
            throw new Error('Thời gian không hợp lệ.');
        }
        return true;
    }),
    (0, express_validator_1.body)('location').trim()
        .notEmpty().withMessage('Vui lòng nhập địa điểm')
        .custom((value, { req }) => {
        return jobLocation_1.JobLocation.findOne({ name: value })
            .then(job => {
            if (!job) {
                return Promise.reject(`Failed to convert 'location' with value: '${value}'`);
            }
            return true;
        });
    }),
    (0, express_validator_1.body)('deadline').trim()
        .notEmpty().withMessage('Vui lòng nhập deadline')
        .isISO8601().toDate().withMessage('Deadline không hợp lệ'),
    (0, express_validator_1.body)('startAt').trim()
        .notEmpty().withMessage('Vui lòng nhập thời gian bắt đầu')
        .isISO8601().toDate().withMessage('Thời gian bắt đầu không hợp lệ')
], recruiterController.UpdateEvent);
router.delete('/events/:eventId', middleware_1.isAuth, (0, express_validator_1.param)('eventId').trim().isMongoId().withMessage('Id không hợp lệ'), recruiterController.DeleteEvent);
router.get('/interviewers', middleware_1.isAuth, [
    (0, express_validator_1.query)('name').trim()
        .custom((value, { req }) => {
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
        .custom(async (value, { req }) => {
        if (value) {
            const skill = await skill_1.Skill.findOne({ name: value });
            if (!skill) {
                throw new Error(`Skill: '${value}' không hợp lệ`);
            }
        }
        return true;
    })
], recruiterController.GetAllInterviewers);
router.get('/interviewers/:interviewerId', middleware_1.isAuth, [
    (0, express_validator_1.param)('interviewerId').trim().isMongoId().withMessage('Id không hợp lệ')
], recruiterController.GetSingleInterviewer);
router.get('/applied-candidates', middleware_1.isAuth, [
    (0, express_validator_1.query)('name').trim()
        .custom((value, { req }) => {
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
        .custom(async (value, { req }) => {
        if (value) {
            const skill = await skill_1.Skill.findOne({ name: value });
            if (!skill) {
                throw new Error(`Skill: '${value}' không hợp lệ`);
            }
        }
        return true;
    }),
    (0, express_validator_1.query)('page').trim()
        .custom((value, { req }) => {
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
        .custom((value, { req }) => {
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
], recruiterController.GetAllApplicants);
router.get('/applied-candidates/:userId', middleware_1.isAuth, [
    (0, express_validator_1.param)('userId').trim().isMongoId().withMessage('Id không hợp lệ')
], recruiterController.GetSingleApplicants);
router.get('/jobs/:jobId/candidates', middleware_1.isAuth, [
    (0, express_validator_1.param)('jobId').trim().isMongoId().withMessage('Id không hợp lệ'),
    (0, express_validator_1.query)('page').trim()
        .custom((value, { req }) => {
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
        .custom((value, { req }) => {
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
], recruiterController.getApplicantsJob);
router.get('/jobs/:jobId/candidates/:candidateId', middleware_1.isAuth, [
    (0, express_validator_1.param)('jobId').trim().isMongoId().withMessage('jobId không hợp lệ'),
    (0, express_validator_1.param)('candidateId').trim().isMongoId().withMessage('candidateId không hợp lệ')
], recruiterController.getSingleApplicantsJob);
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
], recruiterController.createMeeting);
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
], recruiterController.updateCandidateState);
router.get('/jobs/:jobId/suggested-user', middleware_1.isAuth, [
    (0, express_validator_1.param)('jobId').trim().isMongoId().withMessage('jobId không hợp lệ'),
], recruiterController.GetJobSuggestedCandidates);
router.get('/candidates/:candidateId/interviews', middleware_1.isAuth, [
    (0, express_validator_1.param)('candidateId').trim().isMongoId().withMessage('candidateId không hợp lệ'),
    (0, express_validator_1.query)('page').trim()
        .custom((value, { req }) => {
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
        .custom((value, { req }) => {
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
], recruiterController.getInterviewsOfCandidate);
router.get('/interviewers/:interviewerId/interviews', middleware_1.isAuth, [
    (0, express_validator_1.param)('interviewerId').trim().isMongoId().withMessage('interviewerId không hợp lệ'),
    (0, express_validator_1.query)('page').trim()
        .custom((value, { req }) => {
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
        .custom((value, { req }) => {
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
], recruiterController.getInterviewsOfInterviewer);
router.get('/statistics', middleware_1.isAuth, recruiterController.recruiterStatistics);
exports.default = router;
