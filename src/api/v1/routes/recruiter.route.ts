import { Router } from "express";
import * as recruiterController from '../controllers/recruiter.controller';
import { body, param, query } from 'express-validator';
import { JobPosition } from "../models/jobPosition";
import { Job } from "../models/job";
import sanitizeHtml from "sanitize-html";
import { JobType } from "../models/jobType";
import { JobLocation } from "../models/jobLocation";
import { Skill } from "../models/skill";
import { isAuth } from '../middleware';
import { isValidTimeFormat } from "../utils";


const router = Router();

router.get('/jobs',isAuth , [
    query('name').trim()
        .custom((value, {req}) => {
            if (value) {
                const regex = /^[\p{L} ]+$/u; // Cho phép chữ, số và dấu cách
                if (!regex.test(value)) {
                    throw new Error('Tên không được chứa ký tự đặc biệt trừ dấu cách');
                };
                return true
            }
            return true;
        }),
    query('position').trim()
        .custom((value, {req}) => {  
            if (value) {
                return JobPosition.findOne({name: value})
                    .then(pos => {
                        if (!pos) {
                            return Promise.reject(`Failed to convert 'position' with value: '${value}'`)
                        }
                        return true;
                    })   
            }  
            return true        
        }),
    query('type').trim()
        .custom((value, {req}) => {
            if (value) {
                return JobType.findOne({name: value})
                    .then(type => {
                        if (!type) {
                            return Promise.reject(`Failed to convert 'type' with value: '${value}'`)
                        }
                        return true
                    })
            }
            return true
        }),
    query('location').trim()
        .custom((value, {req}) => {
            if (value) {
                return JobLocation.findOne({name: value})
                    .then(loc => {
                        if (!loc) {
                            return Promise.reject(`Failed to convert 'location' with value: '${value}'`)
                        }
                        return true
                    })
            }
            return true
        }),
    query('page').trim()
        .custom((value, {req}) => {
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
        .custom((value, {req}) => {
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
] ,recruiterController.GetAllJobs);

router.post('/job',isAuth , [
    body('name').trim()
        .isLength({min: 5, max:50}).withMessage('Tên công việc trong khoảng 5-50 ký tự')
        .custom((value, {req}) => {
            const regex = /^[\p{L} ,\/0-9]+$/u; 
            if (!regex.test(value)) {
                throw new Error('Tên công việc không được chứa ký tự đặc biệt trừ dấu cách');
            };
            return true;
        }),
    body('jobType').trim()
        .notEmpty().withMessage('Vui lòng nhập jobType')
        .custom(async (value, {req}) => {
            const type = await JobType.findOne({name: value})
            if (!type) {
                return Promise.reject(`Failed to convert 'type' with value: '${value}'`)
            }
            return true
        }),
    body('quantity').trim()
        .notEmpty().withMessage('Vui lòng nhập số lượng')
        .isInt({ min: 1 }).withMessage('Số lượng phải là số nguyên dương'),
    body('benefit').trim()
        .isLength({min: 5, max:200}).withMessage('Benefit trong khoảng 5-200 ký tự')
        .custom((value, {req}) => {
            const regex = /^[\p{L} .,\/:0-9]+$/u;
            if (!regex.test(value)) {
                throw new Error('Benefit không được chứa ký tự đặc biệt trừ dấu cách .,/:');
            };
            return true;
        }),
    body('salaryRange').trim()
        .notEmpty().withMessage('Vui lòng điền mức lương')
        .custom((value, {req}) => {
            const regex = /^[A-Za-z0-9\s$-]+$/; 
            if (!regex.test(value)) {
                throw new Error('Salary Range không được chứa ký tự đặc biệt trừ dấu cách $-');
            };
            return true;
        }),
    body('requirement').trim()
        .isLength({min: 5, max:200}).withMessage('Requirement trong khoảng 5-200 ký tự')
        .custom((value, {req}) => {
            const regex = /^[\p{L} .,\/:0-9]+$/u;
            if (!regex.test(value)) {
                throw new Error('Requirement không được chứa ký tự đặc biệt trừ dấu cách .,/:');
            };
            return true;
        }),
    body('location').trim()
        .notEmpty().withMessage('Vui lòng chọn địa điểm')
        .custom(async (value, {req}) => {
            const location = await JobLocation.findOne({name: value})  
            if (!location) {
                throw new Error(`Failed to convert 'location' with value: '${value}'`);
            }
            return true; 
        }),
    body('description').trim()
        .notEmpty().withMessage('Vui lòng nhập description')
        .custom((value, {req}) => {
            const regex = /^[\p{L} .,\/:0-9]+$/u;
            if (!regex.test(value)) {
                throw new Error('Description không được chứa ký tự đặc biệt trừ dấu cách .,/:');
            };
            return true;
        }),
    body('deadline').trim()
        .notEmpty().withMessage('Vui lòng nhập deadline')
        .isDate().withMessage('deadline không hợp lệ'),
    body('position').trim()
        .notEmpty().withMessage('Vui lòng nhập position')
        .custom(async (value, {req}) => {
            const pos = await JobPosition.findOne({name: value})
            if (!pos) {
                throw new Error(`Failed to convert 'position' with value: '${value}'`);
            }
            return true;
        }),
    body('skillRequired')
        .isArray().withMessage('Skills không hợp lệ')
        .custom(async (value: string[], {req}) => {
            const errors = [];
            for (const skill of value) {
                const s = await Skill.findOne({ name: skill });
                if (!s) {
                    errors.push(`Skill: '${skill}' không hợp lệ`);
                }
            }
            if (errors.length > 0) {
                throw new Error(errors[0]);
            }
            return true;
        })
],recruiterController.CreateJob);

router.get('/jobs/:jobId', isAuth,
    param('jobId').trim().isMongoId().withMessage('Id không hợp lệ')
, recruiterController.GetSingleJob);

router.put('/jobs/:jobId',isAuth , [
    param('jobId').trim().isMongoId().withMessage('Id không hợp lệ'),
    body('name').trim()
        .isLength({min: 5, max:50}).withMessage('Tên công việc trong khoảng 5-50 ký tự')
        .custom((value, {req}) => {
            const regex = /^[\p{L} ,\/0-9]+$/u; 
            if (!regex.test(value)) {
                throw new Error('Tên công việc không được chứa ký tự đặc biệt trừ dấu cách');
            };
            return true;
        }),
    body('jobType').trim()
        .notEmpty().withMessage('Vui lòng nhập jobType')
        .custom(async (value, {req}) => {
            const type = await JobType.findOne({name: value})
            if (!type) {
                return Promise.reject(`Failed to convert 'type' with value: '${value}'`)
            }
            return true
        }),
    body('quantity').trim()
        .notEmpty().withMessage('Vui lòng nhập số lượng')
        .isInt({ min: 1 }).withMessage('Số lượng phải là số nguyên dương'),
    body('benefit').trim()
        .isLength({min: 5, max:200}).withMessage('Benefit trong khoảng 5-200 ký tự')
        .custom((value, {req}) => {
            const regex = /^[\p{L} .,\/:0-9]+$/u;
            if (!regex.test(value)) {
                throw new Error('Benefit không được chứa ký tự đặc biệt trừ dấu cách .,/:');
            };
            return true;
        }),
    body('salaryRange').trim()
        .notEmpty().withMessage('Vui lòng điền mức lương')
        .custom((value, {req}) => {
            const regex = /^[A-Za-z0-9\s$-]+$/; 
            if (!regex.test(value)) {
                throw new Error('Salary Range không được chứa ký tự đặc biệt trừ dấu cách $-');
            };
            return true;
        }),
    body('requirement').trim()
        .isLength({min: 5, max:200}).withMessage('Requirement trong khoảng 5-200 ký tự')
        .custom((value, {req}) => {
            const regex = /^[\p{L} .,\/:0-9]+$/u;
            if (!regex.test(value)) {
                throw new Error('Requirement không được chứa ký tự đặc biệt trừ dấu cách .,/:');
            };
            return true;
        }),
    body('location').trim()
        .notEmpty().withMessage('Vui lòng chọn địa điểm')
        .custom(async (value, {req}) => {
            const location = await JobLocation.findOne({name: value})  
            if (!location) {
                throw new Error(`Failed to convert 'location' with value: '${value}'`);
            }
            return true; 
        }),
    body('description').trim()
        .notEmpty().withMessage('Vui lòng nhập description')
        .custom((value, {req}) => {
            const regex = /^[\p{L} .,\/:0-9]+$/u;
            if (!regex.test(value)) {
                throw new Error('Description không được chứa ký tự đặc biệt trừ dấu cách .,/:');
            };
            return true;
        }),
    body('deadline').trim()
        .notEmpty().withMessage('Vui lòng nhập deadline')
        .isISO8601().toDate().withMessage('deadline không hợp lệ'),
    body('position').trim()
        .notEmpty().withMessage('Vui lòng nhập position')
        .custom(async (value, {req}) => {
            const pos = await JobPosition.findOne({name: value})
            if (!pos) {
                throw new Error(`Failed to convert 'position' with value: '${value}'`);
            }
            return true;
        }),
    body('skillRequired')
        .isArray().withMessage('Skills không hợp lệ')
        .custom(async (value: string[], {req}) => {
            const errors = [];
            for (const skill of value) {
                const s = await Skill.findOne({ name: skill });
                if (!s) {
                    errors.push(`Skill: '${skill}' không hợp lệ`);
                }
            }
            if (errors.length > 0) {
                throw new Error(errors[0]);
            }
            return true;
        })
],recruiterController.UpdateJob);

router.delete('/jobs/:jobId', isAuth,
    param('jobId').trim().isMongoId().withMessage('Id không hợp lệ')
, recruiterController.DeleteJob);

router.get('/events', isAuth,[
    query('page').trim()
        .custom((value, {req}) => {
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
        .custom((value, {req}) => {
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
], recruiterController.GetAllEvents);

router.get('/events/:eventId',isAuth,
    param('eventId').trim().isMongoId().withMessage('Id không hợp lệ')
,recruiterController.GetSingleEvent);

router.post('/events', isAuth, [
    body('title').trim()
        .notEmpty().withMessage('Vui lòng nhập title')
        .custom((value: string, {req}) => {
            const regex = /^[\p{L} ,\/0-9]+$/u;
            if (!regex.test(value)) {
                throw new Error('Title không được chứa ký tự đặc biệt trừ dấu cách ,/:');
            };
            return true;
        }),
    body('name').trim()
        .notEmpty().withMessage('Vui lòng nhập tên')
        .custom((value: string, {req}) => {
            const regex = /^[\p{L} ,\/0-9]+$/u;
            if (!regex.test(value)) {
                throw new Error('Tên không được chứa ký tự đặc biệt trừ dấu cách ,/:');
            };
            return true;
        }),
    body('description').trim()
        .notEmpty().withMessage('Vui lòng nhập description')
        .custom((value: string, {req}) => {
            const regex = /^[\p{L} .,\/:0-9]+$/u;
            if (!regex.test(value)) {
                throw new Error('Description không được chứa ký tự đặc biệt trừ dấu cách .,/:');
            };
            return true;
        }),
    body('time').trim()
        .notEmpty().withMessage('Vui lòng nhập thời gian')
        .custom((value: string, {req}) => {
            if (!isValidTimeFormat(value)) {
                throw new Error('Thời gian không hợp lệ.');
            }
            return true;
        }),
    body('location').trim()
        .notEmpty().withMessage('Vui lòng nhập địa điểm')
        .custom((value: string, {req}) => {
            return JobLocation.findOne({name: value})
                .then(job => {
                    if (!job) {
                        return Promise.reject(`Failed to convert 'location' with value: '${value}'`)
                    }
                    return true
                })
        }),
    body('deadline').trim()
        .notEmpty().withMessage('Vui lòng nhập deadline')
        .isISO8601().toDate().withMessage('Deadline không hợp lệ'),
    body('startAt').trim()
        .notEmpty().withMessage('Vui lòng nhập thời gian bắt đầu')
        .isISO8601().toDate().withMessage('Thời gian bắt đầu không hợp lệ')
], recruiterController.CreateEvent);

router.put('/events/:eventId', isAuth, [
    param('eventId').trim().isMongoId().withMessage('Id không hợp lệ'),
    body('title').trim()
        .custom((value: string, {req}) => {
            const regex = /^[\p{L} .,\/:0-9]+$/u;
            if (!regex.test(value)) {
                throw new Error('Title không được chứa ký tự đặc biệt trừ dấu cách .,/:');
            };
            return true;
        }),
    body('name').trim()
        .custom((value: string, {req}) => {
            const regex = /^[\p{L} .,\/:0-9]+$/u;
            if (!regex.test(value)) {
                throw new Error('Tên không được chứa ký tự đặc biệt trừ dấu cách .,/:');
            };
            return true;
        }),
    body('description').trim()
        .custom((value: string, {req}) => {
            const regex = /^[\p{L} .,\/:0-9]+$/u;
            if (!regex.test(value)) {
                throw new Error('Description không được chứa ký tự đặc biệt trừ dấu cách .,/:');
            };
            return true;
        }),
    body('time').trim()
        .custom((value: string, {req}) => {
            if (!isValidTimeFormat(value)) {
                throw new Error('Thời gian không hợp lệ.');
            }
            return true;
        }),
    body('location').trim()
        .custom((value: string, {req}) => {
            return JobLocation.findOne({name: value})
                .then(job => {
                    if (!job) {
                        return Promise.reject(`Failed to convert 'location' with value: '${value}'`)
                    }
                    return true
                })
        }),
    body('deadline').trim()
        .notEmpty().withMessage('Vui lòng nhập deadline')
        .isISO8601().toDate().withMessage('Deadline không hợp lệ'),
    body('startAt').trim()
        .notEmpty().withMessage('Vui lòng nhập thời gian bắt đầu')
        .isISO8601().toDate().withMessage('Thời gian bắt đầu không hợp lệ')
], recruiterController.UpdateEvent)

router.delete('/events/:eventId', isAuth,
    param('eventId').trim().isMongoId().withMessage('Id không hợp lệ')
, recruiterController.DeleteEvent);

router.get('/interviewers', isAuth, [
    query('name').trim()
        .custom((value, {req}) => {
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
        .custom( async (value, {req}) => {
            if (value) {
                const skill = await Skill.findOne({ name: value });
                if (!skill) {
                    throw new Error(`Skill: '${value}' không hợp lệ`);
                }
            }
            return true;
        })
], recruiterController.GetAllInterviewers);

router.get('/interviewers/:interviewerId', isAuth, [
    param('interviewerId').trim().isMongoId().withMessage('Id không hợp lệ')
], recruiterController.GetSingleInterviewer);

router.get('/applied-candidates', isAuth, [], recruiterController.GetAllApplicants);
router.get('/applied-candidates/:userId', isAuth, [
    param('userId').trim().isMongoId().withMessage('Id không hợp lệ')
], recruiterController.GetSingleApplicants);

router.get('/jobs/:jobId/candidates', isAuth, [
    param('jobId').trim().isMongoId().withMessage('Id không hợp lệ'),
    query('page').trim()
        .custom((value, {req}) => {
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
        .custom((value, {req}) => {
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
], recruiterController.getApplicantsJob);

export default router;