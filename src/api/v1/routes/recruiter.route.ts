import { Router } from "express";
import { recruiterController } from '../controllers/recruiter.controller';
import { body, param, query } from 'express-validator';
import sanitizeHtml from "sanitize-html";
import { isAuth } from '../middleware';
import { isValidTimeFormat, applyStatus, jobPosition, jobType, jobLocation, skills } from "../utils";
import { User } from "../models/user";

const router = Router();

router.get('/jobs', isAuth, [
    query('name').trim()
        .customSanitizer((value: string) => {
            if (value) {
                return sanitizeHtml(value);
            }
        }),
    query('position').trim()
        .custom((value) => {
            if (value) {
                if (!jobPosition.includes(value)) {
                    throw new Error(`Failed to convert 'position' with value: '${value}'`);
                }
            }
            return true
        }),
    query('type').trim()
        .custom((value) => {
            if (value) {
                if (!jobType.includes(value)) {
                    throw new Error(`Failed to convert 'position' with value: '${value}'`);
                }
            }
            return true
        }),
    query('location').trim()
        .custom((value) => {
            if (value) {
                if (!jobLocation.includes(value)) {
                    throw new Error(`Failed to convert 'position' with value: '${value}'`);
                }
            }
            return true
        }),
    query('page').trim()
        .custom((value) => {
            if (value) {
                const regex = /^[0-9]+$/; // Chỉ cho phép số
                if (!regex.test(value)) {
                    throw new Error('page không hợp lệ');
                };
                const intValue = parseInt(value, 10);
                if (isNaN(intValue) || intValue <= 0) {
                    throw new Error('page phải là số nguyên lớn hơn 0');
                }
                return true;
            }
            return true;
        }),
    query('limit').trim()
        .custom((value) => {
            if (value) {
                const regex = /^[0-9]+$/; // Chỉ cho phép số
                if (!regex.test(value)) {
                    throw new Error('limit không hợp lệ');
                };
                const intValue = parseInt(value, 10);
                if (isNaN(intValue) || intValue <= 0) {
                    throw new Error('limit phải là số nguyên lớn hơn 0');
                }
                return true;
            }
            return true;
        }),
], recruiterController.getAllJobs);

router.post('/job', isAuth, [
    body('name').trim()
        .isLength({ min: 5, max: 200 }).withMessage('Tên công việc trong khoảng 5-200 ký tự')
        .customSanitizer((value: string) => {
            return sanitizeHtml(value);
        }),
    body('jobType').trim()
        .notEmpty().withMessage('Vui lòng nhập jobType')
        .custom(async (value: string) => {
            if (!jobType.includes(value)) {
                throw new Error(`Failed to convert 'position' with value: '${value}'`);
            }
            return true;
        }),
    body('quantity').trim()
        .notEmpty().withMessage('Vui lòng nhập số lượng')
        .isInt({ min: 1 }).withMessage('Số lượng phải là số nguyên dương'),
    body('benefit').trim()
        .isLength({ min: 5, max: 500 }).withMessage('Benefit trong khoảng 5-500 ký tự')
        .customSanitizer((value: string) => {
            return sanitizeHtml(value);
        }),
    body('salaryRange').trim()
        .notEmpty().withMessage('Vui lòng điền mức lương')
        .customSanitizer((value: string) => {
            return sanitizeHtml(value);
        }),
    body('requirement').trim()
        .notEmpty().withMessage('Vui lòng nhập requirement')
        .customSanitizer((value: string) => {
            return sanitizeHtml(value);
        }),
    body('location').trim()
        .notEmpty().withMessage('Vui lòng chọn địa điểm')
        .custom(async (value: string) => {
            if (!jobLocation.includes(value)) {
                throw new Error(`Failed to convert 'position' with value: '${value}'`);
            }
            return true;
        }),
    body('description').trim()
        .notEmpty().withMessage('Vui lòng nhập description')
        .customSanitizer((value: string) => {
            return sanitizeHtml(value);
        }),
    body('deadline').trim()
        .notEmpty().withMessage('Vui lòng nhập deadline')
        .isDate().withMessage('deadline không hợp lệ'),
    body('position').trim()
        .notEmpty().withMessage('Vui lòng nhập position')
        .custom(async (value: string) => {
            if (!jobPosition.includes(value)) {
                throw new Error(`Failed to convert 'position' with value: '${value}'`);
            }
            return true;
        }),
    body('skillRequired')
        .isArray().withMessage('Skills không hợp lệ')
        .custom((value: string[]) => {
            const errors = [];
            for (const skill of value) {
                if (!skills.includes(skill)) {
                    errors.push(`Skill: '${skill}' không hợp lệ`);
                }
            }
            if (errors.length > 0) {
                throw new Error(errors[0]);
            }
            return true;
        })
], recruiterController.createJob);

router.get('/jobs/:jobId', isAuth,
    param('jobId').trim().isMongoId().withMessage('Id không hợp lệ')
    , recruiterController.getSingleJob);

router.put('/jobs/:jobId', isAuth, [
    param('jobId').trim().isMongoId().withMessage('Id không hợp lệ'),
    body('name').trim()
        .isLength({ min: 5, max: 200 }).withMessage('Tên công việc trong khoảng 5-200 ký tự')
        .customSanitizer((value: string) => {
            return sanitizeHtml(value);
        }),
    body('jobType').trim()
        .notEmpty().withMessage('Vui lòng nhập jobType')
        .custom((value) => {
            if (!jobType.includes(value)) {
                throw new Error(`Failed to convert 'position' with value: '${value}'`);
            }
            return true
        }),
    body('quantity').trim()
        .notEmpty().withMessage('Vui lòng nhập số lượng')
        .isInt({ min: 1 }).withMessage('Số lượng phải là số nguyên dương'),
    body('benefit').trim()
        .isLength({ min: 5, max: 500 }).withMessage('Benefit trong khoảng 5-500 ký tự')
        .customSanitizer((value: string) => {
            return sanitizeHtml(value);
        }),
    body('salaryRange').trim()
        .notEmpty().withMessage('Vui lòng điền mức lương')
        .customSanitizer((value: string) => {
            return sanitizeHtml(value);
        }),
    body('requirement').trim()
        .notEmpty().withMessage('Vui lòng nhập requirement')
        .customSanitizer((value: string) => {
            return sanitizeHtml(value);
        }),
    body('location').trim()
        .notEmpty().withMessage('Vui lòng chọn địa điểm')
        .custom(async (value) => {
            if (!jobLocation.includes(value)) {
                throw new Error(`Failed to convert 'position' with value: '${value}'`);
            }
            return true;
        }),
    body('description').trim()
        .notEmpty().withMessage('Vui lòng nhập description')
        .customSanitizer((value: string) => {
            return sanitizeHtml(value);
        }),
    body('deadline').trim()
        .notEmpty().withMessage('Vui lòng nhập deadline')
        .isISO8601().toDate().withMessage('deadline không hợp lệ'),
    body('position').trim()
        .notEmpty().withMessage('Vui lòng nhập position')
        .custom(async (value: string) => {
            if (!jobPosition.includes(value)) {
                throw new Error(`Failed to convert 'position' with value: '${value}'`);
            }
            return true;
        }),
    body('skillRequired')
        .isArray().withMessage('Skills không hợp lệ')
        .custom((value: string[]) => {
            const errors = [];
            for (const skill of value) {
                if (!skills.includes(skill)) {
                    errors.push(`Skill: '${skill}' không hợp lệ`);
                }
            }
            if (errors.length > 0) {
                throw new Error(errors[0]);
            }
            return true;
        })
], recruiterController.updateJob);

router.delete('/jobs/:jobId', isAuth,
    param('jobId').trim().isMongoId().withMessage('Id không hợp lệ')
    , recruiterController.deleteJob);

router.get('/events', isAuth, [
    query('name').trim()
        .customSanitizer((value: string) => {
            if (value) {
                const sanitizedValue = sanitizeHtml(value);
                return sanitizedValue;
            }
        }),
    query('page').trim()
        .custom((value: string) => {
            if (value) {
                const regex = /^[0-9]+$/; // Chỉ cho phép số
                if (!regex.test(value)) {
                    throw new Error('page không hợp lệ');
                };
                const intValue = parseInt(value, 10);
                if (isNaN(intValue) || intValue <= 0) {
                    throw new Error('page phải là số nguyên lớn hơn 0');
                }
            }
            return true;
        }),
    query('limit').trim()
        .custom((value: string) => {
            if (value) {
                const regex = /^[0-9]+$/; // Chỉ cho phép số
                if (!regex.test(value)) {
                    throw new Error('limit không hợp lệ');
                };
                const intValue = parseInt(value, 10);
                if (isNaN(intValue) || intValue <= 0) {
                    throw new Error('limit phải là số nguyên lớn hơn 0');
                }
            }
            return true;
        }),
], recruiterController.getAllEvents);

router.get('/events/:eventId', isAuth,
    param('eventId').trim().isMongoId().withMessage('Id không hợp lệ')
    , recruiterController.getSingleEvent);

router.post('/events', isAuth, [
    body('title').trim()
        .notEmpty().withMessage('Vui lòng nhập title')
        .customSanitizer((value: string) => {
            return sanitizeHtml(value);
        }),
    body('name').trim()
        .notEmpty().withMessage('Vui lòng nhập tên')
        .customSanitizer((value: string) => {
            return sanitizeHtml(value);
        }),
    body('description').trim()
        .notEmpty().withMessage('Vui lòng nhập description')
        .customSanitizer((value: string) => {
            return sanitizeHtml(value);
        }),
    body('time').trim()
        .notEmpty().withMessage('Vui lòng nhập thời gian')
        .custom((value: string) => {
            if (!isValidTimeFormat(value)) {
                throw new Error('Thời gian không hợp lệ.');
            }
            return true;
        }),
    body('location').trim()
        .notEmpty().withMessage('Vui lòng nhập địa điểm')
        .custom((value: string) => {
            if (!jobLocation.includes(value)) {
                throw new Error(`Failed to convert 'position' with value: '${value}'`);
            }
            return true;
        }),
    body('deadline').trim()
        .notEmpty().withMessage('Vui lòng nhập deadline')
        .isISO8601().toDate().withMessage('Deadline không hợp lệ'),
    body('startAt').trim()
        .notEmpty().withMessage('Vui lòng nhập thời gian bắt đầu')
        .isISO8601().toDate().withMessage('Thời gian bắt đầu không hợp lệ')
], recruiterController.createEvent);

router.put('/events/:eventId', isAuth, [
    param('eventId').trim().isMongoId().withMessage('Id không hợp lệ'),
    body('title').trim()
        .notEmpty().withMessage('Vui lòng nhập title')
        .customSanitizer((value: string) => {
            return sanitizeHtml(value);
        }),
    body('name').trim()
        .notEmpty().withMessage('Vui lòng nhập tên')
        .customSanitizer((value: string) => {
            return sanitizeHtml(value);
        }),
    body('description').trim()
        .notEmpty().withMessage('Vui lòng nhập description')
        .customSanitizer((value: string) => {
            return sanitizeHtml(value);
        }),
    body('time').trim()
        .notEmpty().withMessage('Vui lòng nhập thời gian')
        .custom((value: string) => {
            if (!isValidTimeFormat(value)) {
                throw new Error('Thời gian không hợp lệ.');
            }
            return true;
        }),
    body('location').trim()
        .notEmpty().withMessage('Vui lòng nhập địa điểm')
        .custom((value: string) => {
            if (!jobLocation.includes(value)) {
                throw new Error(`Failed to convert 'position' with value: '${value}'`);
            }
            return true;
        }),
    body('deadline').trim()
        .notEmpty().withMessage('Vui lòng nhập deadline')
        .isISO8601().toDate().withMessage('Deadline không hợp lệ'),
    body('startAt').trim()
        .notEmpty().withMessage('Vui lòng nhập thời gian bắt đầu')
        .isISO8601().toDate().withMessage('Thời gian bắt đầu không hợp lệ')
], recruiterController.updateEvent)

router.delete('/events/:eventId', isAuth,
    param('eventId').trim().isMongoId().withMessage('Id không hợp lệ')
    , recruiterController.deleteEvent);

router.get('/interviewers', isAuth, [
    query('name').trim()
        .custom((value) => {
            if (value) {
                const regex = /^[\p{L} ]+$/u;
                if (!regex.test(value)) {
                    throw new Error('Tên không được chứa ký tự đặc biệt trừ dấu cách');
                };
                return true;
            }
            return true;
        }),
    query('skill').trim()
        .custom((value) => {
            if (value) {
                if (!skills.includes(value)) {
                    throw new Error(`Skill: '${value}' không hợp lệ`);
                }
            }
            return true;
        })
], recruiterController.getAllInterviewers);

router.get('/interviewers/:interviewerId', isAuth, [
    param('interviewerId').trim().isMongoId().withMessage('Id không hợp lệ')
], recruiterController.getSingleInterviewer);

router.get('/applied-candidates', isAuth, [
    query('name').trim()
        .custom((value) => {
            if (value) {
                const regex = /^[\p{L} ]+$/u;
                if (!regex.test(value)) {
                    throw new Error('Tên không được chứa ký tự đặc biệt trừ dấu cách');
                };
                return true
            }
            return true;
        }),
    query('skill').trim()
        .custom((value) => {
            if (value) {
                if (!skills.includes(value)) {
                    throw new Error(`Skill: '${value}' không hợp lệ`);
                }
            }
            return true;
        }),
    query('page').trim()
        .custom((value) => {
            if (value) {
                const regex = /^[0-9]+$/; // Chỉ cho phép số
                if (!regex.test(value)) {
                    throw new Error('page không hợp lệ');
                };
                const intValue = parseInt(value, 10);
                if (isNaN(intValue) || intValue <= 0) {
                    throw new Error('page phải là số nguyên lớn hơn 0');
                }
            }
            return true;
        }),
    query('limit').trim()
        .custom((value) => {
            if (value) {
                const regex = /^[0-9]+$/; // Chỉ cho phép số
                if (!regex.test(value)) {
                    throw new Error('limit không hợp lệ');
                };
                const intValue = parseInt(value, 10);
                if (isNaN(intValue) || intValue <= 0) {
                    throw new Error('limit phải là số nguyên lớn hơn 0');
                }
            }
            return true;
        }),
], recruiterController.getAllApplicants);

router.get('/applied-candidates/:userId', isAuth, [
    param('userId').trim().isMongoId().withMessage('Id không hợp lệ')
], recruiterController.getSingleApplicant);

router.get('/jobs/:jobId/candidates', isAuth, [
    param('jobId').trim().isMongoId().withMessage('Id không hợp lệ'),
    query('page').trim()
        .custom((value) => {
            if (value) {
                const regex = /^[0-9]+$/; // Chỉ cho phép số
                if (!regex.test(value)) {
                    throw new Error('page không hợp lệ');
                };
                const intValue = parseInt(value, 10);
                if (isNaN(intValue) || intValue <= 0) {
                    throw new Error('page phải là số nguyên lớn hơn 0');
                }
            }
            return true;
        }),
    query('limit').trim()
        .custom((value) => {
            if (value) {
                const regex = /^[0-9]+$/; // Chỉ cho phép số
                if (!regex.test(value)) {
                    throw new Error('limit không hợp lệ');
                };
                const intValue = parseInt(value, 10);
                if (isNaN(intValue) || intValue <= 0) {
                    throw new Error('limit phải là số nguyên lớn hơn 0');
                }
            }
            return true;
        }),
], recruiterController.getApplicantsJob);

router.get('/jobs/:jobId/candidates/:candidateId', isAuth, [
    param('jobId').trim().isMongoId().withMessage('jobId không hợp lệ'),
    param('candidateId').trim().isMongoId().withMessage('candidateId không hợp lệ')
], recruiterController.getSingleApplicantJob);

router.post('/interviews', isAuth, [
    body('candidateId').trim().isMongoId().withMessage('candidateId không hợp lệ'),
    body('jobApplyId').trim().isMongoId().withMessage('jobApplyId không hợp lệ'),
    body('interviewersId').trim()
        .custom(async (value) => {
            for (let interviewerId of value) {
                const interviewer = await User.findById(interviewerId).populate('roleId');
                if (!interviewer || !(interviewer.get('roleId.roleName') === "INTERVIEWER")) {
                    throw new Error(`InterviewerId: '${interviewerId}' không hợp lệ hoặc không có quyền`);
                }
            }
            return true
        }),
    body('time').trim()
        .isISO8601().toDate().withMessage('Thời gian không hợp lệ')
], recruiterController.createMeeting);

router.put('/candidates/state', isAuth, [
    body('candidateId').trim().isMongoId().withMessage('candidateId không hợp lệ'),
    body('jobId').trim().isMongoId().withMessage('candidateId không hợp lệ'),
    body('state').trim()
        .custom((value) => {
            if (!applyStatus.includes(value)) {
                throw new Error(`State: '${value}' không hợp lệ`);
            }
            return true;
        })
], recruiterController.updateCandidateState);

router.get('/jobs/:jobId/suggested-user', isAuth, [
    param('jobId').trim().isMongoId().withMessage('jobId không hợp lệ'),
], recruiterController.getJobSuggestedCandidates);

router.get('/candidates/:candidateId/interviews', isAuth, [
    param('candidateId').trim().isMongoId().withMessage('candidateId không hợp lệ'),
    query('page').trim()
        .custom((value) => {
            if (value) {
                const regex = /^[0-9]+$/; // Chỉ cho phép số
                if (!regex.test(value)) {
                    throw new Error('page không hợp lệ');
                };
                const intValue = parseInt(value, 10);
                if (isNaN(intValue) || intValue <= 0) {
                    throw new Error('page phải là số nguyên lớn hơn 0');
                }
            }
            return true;
        }),
    query('limit').trim()
        .custom((value) => {
            if (value) {
                const regex = /^[0-9]+$/; // Chỉ cho phép số
                if (!regex.test(value)) {
                    throw new Error('limit không hợp lệ');
                };
                const intValue = parseInt(value, 10);
                if (isNaN(intValue) || intValue <= 0) {
                    throw new Error('limit phải là số nguyên lớn hơn 0');
                }
            }
            return true;
        }),
], recruiterController.getInterviewsOfCandidate);

router.get('/interviewers/:interviewerId/interviews', isAuth, [
    param('interviewerId').trim().isMongoId().withMessage('interviewerId không hợp lệ'),
    query('page').trim()
        .custom((value) => {
            if (value) {
                const regex = /^[0-9]+$/;
                if (!regex.test(value)) {
                    throw new Error('page không hợp lệ');
                };
                const intValue = parseInt(value, 10);
                if (isNaN(intValue) || intValue <= 0) {
                    throw new Error('page phải là số nguyên lớn hơn 0');
                }
            }
            return true;
        }),
    query('limit').trim()
        .custom((value) => {
            if (value) {
                const regex = /^[0-9]+$/;
                if (!regex.test(value)) {
                    throw new Error('limit không hợp lệ');
                };
                const intValue = parseInt(value, 10);
                if (isNaN(intValue) || intValue <= 0) {
                    throw new Error('limit phải là số nguyên lớn hơn 0');
                }
            }
            return true;
        }),
], recruiterController.getInterviewsOfInterviewer);

router.get('/statistics', isAuth, recruiterController.recruiterStatistics);

export default router;