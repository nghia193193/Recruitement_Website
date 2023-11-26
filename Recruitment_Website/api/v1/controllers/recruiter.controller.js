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
exports.createMeeting = exports.getSingleApplicantsJob = exports.getApplicantsJob = exports.GetSingleApplicants = exports.GetAllApplicants = exports.GetSingleInterviewer = exports.GetAllInterviewers = exports.DeleteEvent = exports.UpdateEvent = exports.CreateEvent = exports.GetSingleEvent = exports.GetAllEvents = exports.DeleteJob = exports.UpdateJob = exports.GetSingleJob = exports.CreateJob = exports.GetAllJobs = void 0;
const utils_1 = require("../utils");
const express_validator_1 = require("express-validator");
const user_1 = require("../models/user");
const jobPosition_1 = require("../models/jobPosition");
const job_1 = require("../models/job");
const jobType_1 = require("../models/jobType");
const jobLocation_1 = require("../models/jobLocation");
const skill_1 = require("../models/skill");
const event_1 = require("../models/event");
const cloudinary_1 = require("cloudinary");
const role_1 = require("../models/role");
const jobApply_1 = require("../models/jobApply");
const education_1 = require("../models/education");
const experience_1 = require("../models/experience");
const certificate_1 = require("../models/certificate");
const project_1 = require("../models/project");
const identity_1 = require("@azure/identity");
const GraphClient = __importStar(require("@microsoft/microsoft-graph-client"));
const interview_1 = require("../models/interview");
const interviewerInterview_1 = require("../models/interviewerInterview");
const resumeUpload_1 = require("../models/resumeUpload");
const GetAllJobs = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyToken)(accessToken);
        const recruiter = await user_1.User.findById(decodedToken.userId).populate('roleId');
        if (recruiter?.get('roleId.roleName') !== 'RECRUITER') {
            const error = new Error('UnAuthorized');
            error.statusCode = 401;
            error.result = {
                content: []
            };
            throw error;
        }
        ;
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
            authorId: recruiter._id
        };
        if (req.query['name']) {
            query['name'] = req.query['name'];
        }
        ;
        if (req.query['type']) {
            const jobType = await jobType_1.JobType.findOne({ name: req.query['type'] });
            query['typeId'] = jobType?._id;
        }
        ;
        if (req.query['position']) {
            const jobPos = await jobPosition_1.JobPosition.findOne({ name: req.query['position'] });
            query['positionId'] = jobPos?._id;
        }
        ;
        if (req.query['location']) {
            const jobLoc = await jobLocation_1.JobLocation.findOne({ name: req.query['location'] });
            query['locationId'] = jobLoc?._id;
        }
        ;
        const jobLength = await job_1.Job.find(query).countDocuments();
        if (jobLength === 0) {
            const error = new Error('Không tìm thấy job');
            error.statusCode = 200;
            error.success = true;
            error.result = {
                content: []
            };
            throw error;
        }
        ;
        const jobs = await job_1.Job.find(query).populate('positionId locationId typeId skills.skillId')
            .sort({ updatedAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);
        const listjobs = jobs.map(job => {
            const { _id, skills, positionId, locationId, typeId, ...rest } = job;
            delete rest._doc._id;
            delete rest._doc.skills;
            delete rest._doc.positionId;
            delete rest._doc.locationId;
            delete rest._doc.typeId;
            const listSkills = skills.map(skill => {
                return skill.skillId.name;
            });
            return {
                jobId: _id.toString(),
                position: positionId.name,
                location: locationId.name,
                jobType: typeId.name,
                ...rest._doc,
                skills: listSkills
            };
        });
        res.status(200).json({ success: true, message: 'Successfully', statusCode: 200, result: {
                pageNumber: page,
                totalPages: Math.ceil(jobLength / limit),
                limit: limit,
                totalElements: jobLength,
                content: listjobs
            } });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        next(err);
    }
};
exports.GetAllJobs = GetAllJobs;
const CreateJob = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const { name, jobType, quantity, benefit, salaryRange, requirement, location, description, deadline, position, skillRequired } = req.body;
        const errors = (0, express_validator_1.validationResult)(req);
        const decodedToken = await (0, utils_1.verifyToken)(accessToken);
        const recruiter = await user_1.User.findById(decodedToken.userId).populate('roleId');
        if (recruiter?.get('roleId.roleName') !== 'RECRUITER') {
            const error = new Error('UnAuthorized');
            error.statusCode = 401;
            error.result = null;
            throw error;
        }
        ;
        if (!errors.isEmpty()) {
            const error = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        const pos = await jobPosition_1.JobPosition.findOne({ name: position });
        const type = await jobType_1.JobType.findOne({ name: jobType });
        const loc = await jobLocation_1.JobLocation.findOne({ name: location });
        let listSkill = [];
        for (let skill of skillRequired) {
            const s = await skill_1.Skill.findOne({ name: skill });
            listSkill.push({ skillId: s._id });
        }
        ;
        const job = new job_1.Job({
            name: name,
            positionId: pos._id.toString(),
            typeId: type._id.toString(),
            authorId: recruiter._id.toString(),
            quantity: +quantity,
            benefit: benefit,
            salaryRange: salaryRange,
            requirement: requirement,
            locationId: loc._id.toString(),
            description: description,
            isActive: true,
            deadline: deadline,
            skills: listSkill
        });
        await job.save();
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
exports.CreateJob = CreateJob;
const GetSingleJob = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyToken)(accessToken);
        const recruiter = await user_1.User.findById(decodedToken.userId).populate('roleId');
        if (recruiter?.get('roleId.roleName') !== 'RECRUITER') {
            const error = new Error('UnAuthorized');
            error.statusCode = 401;
            error.result = null;
            throw error;
        }
        ;
        const jobId = req.params.jobId;
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            const error = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        ;
        const job = await job_1.Job.findOne({ authorId: recruiter._id, _id: jobId })
            .populate('positionId locationId typeId skills.skillId');
        if (!job) {
            const error = new Error('Không tìm thấy job');
            error.statusCode = 409;
            error.result = null;
            throw error;
        }
        const { _id, skills, positionId, locationId, typeId, ...rest } = job;
        delete rest._doc._id;
        delete rest._doc.skills;
        delete rest._doc.positionId;
        delete rest._doc.locationId;
        delete rest._doc.typeId;
        const listSkills = skills.map(skill => {
            return skill.skillId.name;
        });
        const returnJob = {
            jobId: _id.toString(),
            position: positionId.name,
            location: locationId.name,
            jobType: typeId.name,
            ...rest._doc,
            skills: listSkills
        };
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
exports.GetSingleJob = GetSingleJob;
const UpdateJob = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const jobId = req.params.jobId;
        const { name, jobType, quantity, benefit, salaryRange, requirement, location, description, deadline, position, skillRequired } = req.body;
        const errors = (0, express_validator_1.validationResult)(req);
        const decodedToken = await (0, utils_1.verifyToken)(accessToken);
        const recruiter = await user_1.User.findById(decodedToken.userId).populate('roleId');
        if (recruiter?.get('roleId.roleName') !== 'RECRUITER') {
            const error = new Error('UnAuthorized');
            error.statusCode = 401;
            error.result = null;
            throw error;
        }
        ;
        if (!errors.isEmpty()) {
            const error = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        ;
        const pos = await jobPosition_1.JobPosition.findOne({ name: position });
        const type = await jobType_1.JobType.findOne({ name: jobType });
        const loc = await jobLocation_1.JobLocation.findOne({ name: location });
        let listSkill = [];
        for (let skill of skillRequired) {
            const s = await skill_1.Skill.findOne({ name: skill });
            listSkill.push({ skillId: s._id });
        }
        ;
        const job = await job_1.Job.findOne({ authorId: recruiter._id, _id: jobId });
        if (!job) {
            const error = new Error('Không tìm thấy job');
            error.statusCode = 409;
            error.result = null;
            throw error;
        }
        ;
        job.name = name;
        job.positionId = pos._id.toString();
        job.typeId = type._id.toString();
        job.quantity = +quantity;
        job.benefit = benefit;
        job.salaryRange = salaryRange;
        job.requirement = requirement;
        job.locationId = loc._id.toString();
        job.description = description;
        job.deadline = deadline;
        job.skills = listSkill;
        await job.save();
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
exports.UpdateJob = UpdateJob;
const DeleteJob = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const jobId = req.params.jobId;
        const errors = (0, express_validator_1.validationResult)(req);
        const decodedToken = await (0, utils_1.verifyToken)(accessToken);
        const recruiter = await user_1.User.findById(decodedToken.userId).populate('roleId');
        if (!recruiter) {
            const error = new Error('Không tìm thấy user');
            error.statusCode = 409;
            error.result = null;
            throw error;
        }
        ;
        if (recruiter.get('roleId.roleName') !== 'RECRUITER') {
            const error = new Error('UnAuthorized');
            error.statusCode = 401;
            error.result = null;
            throw error;
        }
        ;
        if (!errors.isEmpty()) {
            const error = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        ;
        const job = await job_1.Job.findOne({ authorId: recruiter._id, _id: jobId });
        if (!job) {
            const error = new Error('Không tìm thấy job');
            error.statusCode = 409;
            error.result = null;
            throw error;
        }
        await job_1.Job.findByIdAndDelete(jobId);
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
exports.DeleteJob = DeleteJob;
const GetAllEvents = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyToken)(accessToken);
        const recruiter = await user_1.User.findById(decodedToken.userId).populate('roleId');
        if (recruiter?.get('roleId.roleName') !== 'RECRUITER') {
            const error = new Error('UnAuthorized');
            error.statusCode = 401;
            error.result = {
                content: []
            };
            throw error;
        }
        ;
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
            authorId: recruiter._id
        };
        if (name) {
            query['name'] = name;
        }
        ;
        const eventLenght = await event_1.Event.find(query).countDocuments();
        if (eventLenght === 0) {
            const error = new Error('Không tìm thấy event');
            error.statusCode = 200;
            error.success = true;
            error.result = {
                content: []
            };
            throw error;
        }
        ;
        const events = await event_1.Event.find(query).populate('authorId')
            .sort({ updatedAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);
        const listEvents = events.map(e => {
            const { _id, authorId, ...rest } = e;
            delete rest._doc._id;
            delete rest._doc.authorId;
            return {
                eventId: _id.toString(),
                author: authorId.fullName,
                ...rest._doc
            };
        });
        res.status(200).json({ success: true, message: 'Successfully', statusCode: 200, result: {
                pageNumber: page,
                totalPages: Math.ceil(eventLenght / limit),
                limit: limit,
                totalElements: eventLenght,
                content: listEvents
            } });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        next(err);
    }
};
exports.GetAllEvents = GetAllEvents;
const GetSingleEvent = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyToken)(accessToken);
        const recruiter = await user_1.User.findById(decodedToken.userId).populate('roleId');
        if (!recruiter) {
            const error = new Error('Không tìm thấy user');
            error.statusCode = 409;
            error.result = null;
            throw error;
        }
        ;
        if (recruiter.get('roleId.roleName') !== 'RECRUITER') {
            const error = new Error('UnAuthorized');
            error.statusCode = 401;
            error.result = null;
            throw error;
        }
        ;
        const eventId = req.params.eventId;
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            const error = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        const event = await event_1.Event.findById(eventId).populate('authorId');
        if (!event) {
            const error = new Error('Không tìm thấy event');
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        const { _id, authorId, ...rest } = event;
        delete rest._doc._id;
        delete rest._doc.authorId;
        const returnEvent = {
            eventId: _id.toString(),
            author: authorId.fullName,
            ...rest._doc,
        };
        res.status(200).json({ success: true, message: 'Successfully', result: returnEvent });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        next(err);
    }
};
exports.GetSingleEvent = GetSingleEvent;
const CreateEvent = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyToken)(accessToken);
        const recruiter = await user_1.User.findById(decodedToken.userId).populate('roleId');
        if (!recruiter) {
            const error = new Error('Không tìm thấy user');
            error.statusCode = 409;
            error.result = null;
            throw error;
        }
        ;
        if (recruiter.get('roleId.roleName') !== 'RECRUITER') {
            const error = new Error('UnAuthorized');
            error.statusCode = 401;
            error.result = null;
            throw error;
        }
        ;
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
        const result = await cloudinary_1.v2.uploader.upload(image.tempFilePath);
        if (!result) {
            const error = new Error('Upload thất bại');
            throw error;
        }
        ;
        const publicId = result.public_id;
        const imageUrl = cloudinary_1.v2.url(publicId);
        const event = new event_1.Event({
            authorId: recruiter._id,
            title: title,
            name: name,
            description: description,
            time: time,
            image: {
                publicId: publicId,
                url: imageUrl
            },
            isActive: true,
            location: location,
            deadline: deadline,
            startAt: startAt
        });
        await event.save();
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
exports.CreateEvent = CreateEvent;
const UpdateEvent = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyToken)(accessToken);
        const recruiter = await user_1.User.findById(decodedToken.userId).populate('roleId');
        if (!recruiter) {
            const error = new Error('Không tìm thấy user');
            error.statusCode = 409;
            error.result = null;
            throw error;
        }
        ;
        if (recruiter.get('roleId.roleName') !== 'RECRUITER') {
            const error = new Error('UnAuthorized');
            error.statusCode = 401;
            error.result = null;
            throw error;
        }
        ;
        const eventId = req.params.eventId;
        const { title, name, description, time, location, deadline, startAt } = req.body;
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            const error = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        const event = await event_1.Event.findById(eventId);
        if (!event) {
            const error = new Error('event không tồn tại');
            error.statusCode = 409;
            error.result = null;
            throw error;
        }
        if (req.files?.image) {
            const image = req.files.image;
            if (image.mimetype !== 'image/jpg' && image.mimetype !== 'image/png' && image.mimetype !== 'image/jpeg') {
                const error = new Error('File ảnh chỉ được phép là jpg,png,jpeg');
                error.statusCode = 400;
                error.result = null;
                throw error;
            }
            ;
            const result = await cloudinary_1.v2.uploader.upload(image.tempFilePath);
            if (!result) {
                const error = new Error('Upload thất bại');
                throw error;
            }
            ;
            const publicId = result.public_id;
            const imageUrl = cloudinary_1.v2.url(publicId);
            const deleteEventImage = event.image?.publicId;
            if (deleteEventImage) {
                await cloudinary_1.v2.uploader.destroy(deleteEventImage);
            }
            event.image = {
                publicId: publicId,
                url: imageUrl
            };
        }
        event.title = title;
        event.name = name;
        event.description = description;
        event.time = time;
        event.location = location;
        event.deadline = deadline;
        event.startAt = startAt;
        await event.save();
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
exports.UpdateEvent = UpdateEvent;
const DeleteEvent = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyToken)(accessToken);
        const recruiter = await user_1.User.findById(decodedToken.userId).populate('roleId');
        if (!recruiter) {
            const error = new Error('Không tìm thấy user');
            error.statusCode = 409;
            error.result = null;
            throw error;
        }
        ;
        if (recruiter.get('roleId.roleName') !== 'RECRUITER') {
            const error = new Error('UnAuthorized');
            error.statusCode = 401;
            error.result = null;
            throw error;
        }
        ;
        const eventId = req.params.eventId;
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            const error = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        const event = await event_1.Event.findById(eventId);
        if (!event) {
            const error = new Error('event không tồn tại');
            error.statusCode = 409;
            error.result = null;
            throw error;
        }
        const deleteEventImage = event.image?.publicId;
        if (deleteEventImage) {
            await cloudinary_1.v2.uploader.destroy(deleteEventImage);
        }
        await event_1.Event.findByIdAndDelete(eventId);
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
exports.DeleteEvent = DeleteEvent;
const GetAllInterviewers = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyToken)(accessToken);
        const recruiter = await user_1.User.findById(decodedToken.userId).populate('roleId');
        if (recruiter?.get('roleId.roleName') !== 'RECRUITER') {
            const error = new Error('UnAuthorized');
            error.statusCode = 401;
            error.result = {
                content: []
            };
            throw error;
        }
        ;
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
        const roleInterviewerId = await role_1.Role.findOne({ roleName: "INTERVIEWER" });
        const query = {
            roleId: roleInterviewerId?._id.toString()
        };
        if (req.query['name']) {
            query['fullName'] = new RegExp(req.query['name'], 'i');
        }
        ;
        if (req.query['skill']) {
            const skillId = await skill_1.Skill.findOne({ name: req.query['skill'] });
            query['skills.skillId'] = skillId;
        }
        const interviewerLength = await user_1.User.find(query).countDocuments();
        const interviewerList = await user_1.User.find(query).populate('roleId skills.skillId')
            .sort({ updatedAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);
        const returnInterviewerList = async () => {
            const mappedInterviewers = await Promise.all(interviewerList.map(async (interviewer) => {
                try {
                    const educationList = await education_1.Education.find({ candidateId: interviewer._id.toString() });
                    const returnEducationList = educationList.map(e => {
                        return {
                            school: e.school,
                            major: e.major,
                            graduatedYead: e.graduatedYear
                        };
                    });
                    const experienceList = await experience_1.Experience.find({ candidateId: interviewer._id.toString() });
                    const returnExperienceList = experienceList.map(e => {
                        return {
                            companyName: e.companyName,
                            position: e.position,
                            dateFrom: e.dateFrom,
                            dateTo: e.dateTo
                        };
                    });
                    const certificateList = await certificate_1.Certificate.find({ candidateId: interviewer._id.toString() });
                    const returnCertificateList = certificateList.map(c => {
                        return {
                            name: c.name,
                            receivedDate: c.receivedDate,
                            url: c.url
                        };
                    });
                    const projectList = await project_1.Project.find({ candidateId: interviewer._id.toString() });
                    const returnProjectList = projectList.map(p => {
                        return {
                            name: p.name,
                            description: p.description,
                            url: p.url
                        };
                    });
                    let listSkill = [];
                    for (let i = 0; i < interviewer.skills.length; i++) {
                        listSkill.push({ label: interviewer.skills[i].skillId.name, value: i });
                    }
                    return {
                        interviewerId: interviewer._id.toString(),
                        avatar: interviewer.avatar?.url,
                        fullName: interviewer.fullName,
                        about: interviewer.about,
                        email: interviewer.email,
                        dateOfBirth: interviewer.dateOfBirth,
                        address: interviewer.address,
                        phone: interviewer.phone,
                        information: {
                            education: returnEducationList,
                            experience: returnExperienceList,
                            certificate: returnCertificateList,
                            project: returnProjectList,
                            skills: listSkill
                        }
                    };
                }
                catch (error) {
                    console.error(error);
                    return null;
                }
            }));
            return mappedInterviewers.filter(interviewer => interviewer !== null);
        };
        returnInterviewerList().then(mappedInterviewers => {
            res.status(200).json({ success: true, message: 'Successfully', result: {
                    pageNumber: page,
                    totalPages: Math.ceil(interviewerLength / limit),
                    limit: limit,
                    totalElements: interviewerLength,
                    content: mappedInterviewers
                } });
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
exports.GetAllInterviewers = GetAllInterviewers;
const GetSingleInterviewer = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyToken)(accessToken);
        const recruiter = await user_1.User.findById(decodedToken.userId).populate('roleId');
        if (recruiter?.get('roleId.roleName') !== 'RECRUITER') {
            const error = new Error('UnAuthorized');
            error.statusCode = 401;
            error.result = null;
            throw error;
        }
        ;
        const interviewerId = req.params.interviewerId;
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            const error = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        const interviewer = await user_1.User.findById(interviewerId).populate('roleId skills.skillId');
        if (!interviewer) {
            const error = new Error('Interviewer không tồn tại');
            error.statusCode = 409;
            error.result = null;
            throw error;
        }
        const educationList = await education_1.Education.find({ candidateId: interviewer._id.toString() });
        const returnEducationList = educationList.map(e => {
            return {
                school: e.school,
                major: e.major,
                graduatedYead: e.graduatedYear
            };
        });
        const experienceList = await experience_1.Experience.find({ candidateId: interviewer._id.toString() });
        const returnExperienceList = experienceList.map(e => {
            return {
                companyName: e.companyName,
                position: e.position,
                dateFrom: e.dateFrom,
                dateTo: e.dateTo
            };
        });
        const certificateList = await certificate_1.Certificate.find({ candidateId: interviewer._id.toString() });
        const returnCertificateList = certificateList.map(c => {
            return {
                name: c.name,
                receivedDate: c.receivedDate,
                url: c.url
            };
        });
        const projectList = await project_1.Project.find({ candidateId: interviewer._id.toString() });
        const returnProjectList = projectList.map(p => {
            return {
                name: p.name,
                description: p.description,
                url: p.url
            };
        });
        let listSkill = [];
        for (let i = 0; i < interviewer.skills.length; i++) {
            listSkill.push({ label: interviewer.skills[i].skillId.name, value: i });
        }
        const returnInterviewer = {
            fullName: interviewer.fullName,
            avatar: interviewer.avatar?.url,
            about: interviewer.about,
            email: interviewer.email,
            dateOfBirth: interviewer.dateOfBirth,
            address: interviewer.address,
            phone: interviewer.phone,
            skills: listSkill,
            information: {
                education: returnEducationList,
                experience: returnExperienceList,
                certificate: returnCertificateList,
                project: returnProjectList,
                skills: listSkill
            }
        };
        res.status(200).json({ success: true, message: 'Successfully', result: returnInterviewer });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        next(err);
    }
};
exports.GetSingleInterviewer = GetSingleInterviewer;
const GetAllApplicants = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyToken)(accessToken);
        const recruiter = await user_1.User.findById(decodedToken.userId).populate('roleId');
        if (recruiter?.get('roleId.roleName') !== 'RECRUITER') {
            const error = new Error('UnAuthorized');
            error.statusCode = 401;
            error.result = null;
            throw error;
        }
        ;
        const page = req.query.page ? +req.query.page : 1;
        const limit = req.query.limit ? +req.query.limit : 10;
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            const error = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        const query = {};
        if (req.query['name']) {
            query['fullName'] = new RegExp(req.query['name'], 'i');
        }
        ;
        if (req.query['skill']) {
            query['skill'] = req.query['skill'];
        }
        const matchName = query['fullName'] ? { fullName: query['fullName'] } : {};
        const matchSkill = query['skill'] ? { name: query['skill'] } : {};
        console.log('match Skill: ', matchSkill);
        const ListApplicants = await jobApply_1.JobApply.find()
            .populate({
            path: 'jobAppliedId',
            model: job_1.Job,
            match: {
                authorId: recruiter._id.toString()
            },
        })
            .populate({
            path: 'candidateId',
            model: user_1.User,
            match: matchName,
            populate: {
                path: 'skills.skillId',
                model: skill_1.Skill,
            }
        })
            .sort({ updatedAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);
        ListApplicants.forEach(app => {
            console.log(app.candidateId.skills);
        });
        const returnListApplicants = async () => {
            const mappedApplicants = await Promise.all(ListApplicants.map(async (applicant) => {
                try {
                    const educationList = await education_1.Education.find({ candidateId: applicant.candidateId._id.toString() });
                    const returnEducationList = educationList.map(e => {
                        return {
                            school: e.school,
                            major: e.major,
                            graduatedYead: e.graduatedYear
                        };
                    });
                    const experienceList = await experience_1.Experience.find({ candidateId: applicant.candidateId._id.toString() });
                    const returnExperienceList = experienceList.map(e => {
                        return {
                            companyName: e.companyName,
                            position: e.position,
                            dateFrom: e.dateFrom,
                            dateTo: e.dateTo
                        };
                    });
                    const certificateList = await certificate_1.Certificate.find({ candidateId: applicant.candidateId._id.toString() });
                    const returnCertificateList = certificateList.map(c => {
                        return {
                            name: c.name,
                            receivedDate: c.receivedDate,
                            url: c.url
                        };
                    });
                    const projectList = await project_1.Project.find({ candidateId: applicant.candidateId._id.toString() });
                    const returnProjectList = projectList.map(p => {
                        return {
                            name: p.name,
                            description: p.description,
                            url: p.url
                        };
                    });
                    let listSkill = [];
                    for (let i = 0; i < applicant.get('candidateId.skills').length; i++) {
                        listSkill.push({ label: applicant.get('candidateId.skills')[i].skillId.name, value: i });
                    }
                    return {
                        candidateId: applicant.candidateId._id.toString(),
                        blackList: applicant.get('candidateId.blackList'),
                        avatar: applicant.get('candidateId.avatar.url'),
                        candidateFullName: applicant.get('candidateId.fullName'),
                        candidateEmail: applicant.get('candidateId.email'),
                        interviewerFullNames: [],
                        score: null,
                        state: 'NOT_RECEIVED',
                        about: applicant.get('candidateId.about'),
                        dateOfBirth: applicant.get('candidateId.dateOfBirth'),
                        address: applicant.get('candidateId.address'),
                        phone: applicant.get('candidateId.phone'),
                        information: {
                            education: returnEducationList,
                            experience: returnExperienceList,
                            certificate: returnCertificateList,
                            project: returnProjectList,
                            skills: listSkill
                        }
                    };
                }
                catch (error) {
                    console.error(error);
                    return null;
                }
            }));
            const getHash = (obj) => JSON.stringify(obj);
            return Array.from(new Set(mappedApplicants.filter(applicant => applicant !== null).map(getHash))).map((hash) => JSON.parse(hash));
        };
        returnListApplicants().then(mappedApplicants => {
            res.status(200).json({ success: true, message: 'Successfully', result: mappedApplicants });
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
exports.GetAllApplicants = GetAllApplicants;
const GetSingleApplicants = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyToken)(accessToken);
        const recruiter = await user_1.User.findById(decodedToken.userId).populate('roleId');
        if (recruiter?.get('roleId.roleName') !== 'RECRUITER') {
            const error = new Error('UnAuthorized');
            error.statusCode = 401;
            error.result = null;
            throw error;
        }
        ;
        const applicantId = req.params.userId;
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            const error = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        const applicant = await user_1.User.findById(applicantId).populate('roleId skills.skillId');
        if (!applicant) {
            const error = new Error('Ứng viên không tồn tại');
            error.statusCode = 409;
            error.result = null;
            throw error;
        }
        const educationList = await education_1.Education.find({ candidateId: applicant._id.toString() });
        const returnEducationList = educationList.map(e => {
            return {
                school: e.school,
                major: e.major,
                graduatedYead: e.graduatedYear
            };
        });
        const experienceList = await experience_1.Experience.find({ candidateId: applicant._id.toString() });
        const returnExperienceList = experienceList.map(e => {
            return {
                companyName: e.companyName,
                position: e.position,
                dateFrom: e.dateFrom,
                dateTo: e.dateTo
            };
        });
        const certificateList = await certificate_1.Certificate.find({ candidateId: applicant._id.toString() });
        const returnCertificateList = certificateList.map(c => {
            return {
                name: c.name,
                receivedDate: c.receivedDate,
                url: c.url
            };
        });
        const projectList = await project_1.Project.find({ candidateId: applicant._id.toString() });
        const returnProjectList = projectList.map(p => {
            return {
                name: p.name,
                description: p.description,
                url: p.url
            };
        });
        let listSkill = [];
        for (let i = 0; i < applicant.skills.length; i++) {
            listSkill.push({ label: applicant.skills[i].skillId.name, value: i });
        }
        const returnApplicant = {
            candidateId: applicant._id.toString(),
            blackList: applicant.blackList,
            avatar: applicant.get('avatar.url'),
            candidateFullName: applicant.fullName,
            candidateEmail: applicant.email,
            interviewerFullNames: [],
            score: null,
            state: 'NOT_RECEIVED',
            about: applicant.about,
            dateOfBirth: applicant.dateOfBirth,
            address: applicant.address,
            phone: applicant.phone,
            information: {
                education: returnEducationList,
                experience: returnExperienceList,
                certificate: returnCertificateList,
                project: returnProjectList,
                skills: listSkill
            }
        };
        res.status(200).json({ success: true, message: 'Successfully', result: returnApplicant });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        next(err);
    }
};
exports.GetSingleApplicants = GetSingleApplicants;
const getApplicantsJob = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyToken)(accessToken);
        const recruiter = await user_1.User.findById(decodedToken.userId).populate('roleId');
        if (recruiter?.get('roleId.roleName') !== 'RECRUITER') {
            const error = new Error('UnAuthorized');
            error.statusCode = 401;
            error.result = null;
            throw error;
        }
        ;
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
        const applicantsJobLength = await jobApply_1.JobApply.find({ jobAppliedId: jobId }).countDocuments();
        if (applicantsJobLength === 0) {
            const error = new Error('Chưa có ứng viên nào apply vào công việc này');
            error.statusCode = 200;
            error.result = {
                content: []
            };
            throw error;
        }
        const ListApplicantsJob = await jobApply_1.JobApply.find({ jobAppliedId: jobId })
            .populate({
            path: 'candidateId',
            model: user_1.User,
            populate: {
                path: 'skills.skillId',
                model: skill_1.Skill
            }
        })
            .skip((page - 1) * limit)
            .limit(limit);
        console.log(ListApplicantsJob);
        const returnListApplicants = async () => {
            const mappedApplicants = await Promise.all(ListApplicantsJob.map(async (applicant) => {
                try {
                    const educationList = await education_1.Education.find({ candidateId: applicant.candidateId._id.toString() });
                    const returnEducationList = educationList.map(e => {
                        return {
                            school: e.school,
                            major: e.major,
                            graduatedYead: e.graduatedYear
                        };
                    });
                    const experienceList = await experience_1.Experience.find({ candidateId: applicant.candidateId._id.toString() });
                    const returnExperienceList = experienceList.map(e => {
                        return {
                            companyName: e.companyName,
                            position: e.position,
                            dateFrom: e.dateFrom,
                            dateTo: e.dateTo
                        };
                    });
                    const certificateList = await certificate_1.Certificate.find({ candidateId: applicant.candidateId._id.toString() });
                    const returnCertificateList = certificateList.map(c => {
                        return {
                            name: c.name,
                            receivedDate: c.receivedDate,
                            url: c.url
                        };
                    });
                    const projectList = await project_1.Project.find({ candidateId: applicant.candidateId._id.toString() });
                    const returnProjectList = projectList.map(p => {
                        return {
                            name: p.name,
                            description: p.description,
                            url: p.url
                        };
                    });
                    let listSkill = [];
                    for (let i = 0; i < applicant.get('candidateId.skills').length; i++) {
                        listSkill.push({ label: applicant.get('candidateId.skills')[i].skillId.name, value: i });
                    }
                    return {
                        candidateId: applicant.candidateId._id.toString(),
                        blackList: applicant.get('candidateId.blackList'),
                        avatar: applicant.get('candidateId.avatar.url'),
                        candidateFullName: applicant.get('candidateId.fullName'),
                        candidateEmail: applicant.get('candidateId.email'),
                        interviewerFullNames: [],
                        score: null,
                        state: 'NOT_RECEIVED',
                        dateOfBirth: applicant.get('candidateId.dateOfBirth'),
                        address: applicant.get('candidateId.address'),
                        phone: applicant.get('candidateId.phone'),
                        information: {
                            education: returnEducationList,
                            experience: returnExperienceList,
                            certificate: returnCertificateList,
                            project: returnProjectList,
                            skills: listSkill
                        }
                    };
                }
                catch (error) {
                    console.error(error);
                    return null;
                }
            }));
            return mappedApplicants.filter(applicant => applicant !== null);
        };
        returnListApplicants().then(mappedApplicants => {
            res.status(200).json({ success: true, message: 'Successfully', result: {
                    pageNumber: page,
                    totalPages: Math.ceil(applicantsJobLength / limit),
                    limit: limit,
                    totalElements: applicantsJobLength,
                    content: mappedApplicants
                } });
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
const getSingleApplicantsJob = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyToken)(accessToken);
        const recruiter = await user_1.User.findById(decodedToken.userId).populate('roleId');
        if (recruiter?.get('roleId.roleName') !== 'RECRUITER') {
            const error = new Error('UnAuthorized');
            error.statusCode = 401;
            error.result = null;
            throw error;
        }
        ;
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
        const applicant = await jobApply_1.JobApply.findOne({ jobAppliedId: jobId, candidateId: candidateId })
            .populate({
            path: 'candidateId',
            model: user_1.User,
            populate: {
                path: 'skills.skillId',
                model: skill_1.Skill
            }
        });
        if (!applicant) {
            const error = new Error('Không thể tìm thấy ứng viên');
            error.statusCode = 409;
            error.result = null;
            throw error;
        }
        const educationList = await education_1.Education.find({ candidateId: applicant.candidateId._id.toString() });
        const returnEducationList = educationList.map(e => {
            return {
                school: e.school,
                major: e.major,
                graduatedYead: e.graduatedYear
            };
        });
        const experienceList = await experience_1.Experience.find({ candidateId: applicant.candidateId._id.toString() });
        const returnExperienceList = experienceList.map(e => {
            return {
                companyName: e.companyName,
                position: e.position,
                dateFrom: e.dateFrom,
                dateTo: e.dateTo
            };
        });
        const certificateList = await certificate_1.Certificate.find({ candidateId: applicant.candidateId._id.toString() });
        const returnCertificateList = certificateList.map(c => {
            return {
                name: c.name,
                receivedDate: c.receivedDate,
                url: c.url
            };
        });
        const projectList = await project_1.Project.find({ candidateId: applicant.candidateId._id.toString() });
        const returnProjectList = projectList.map(p => {
            return {
                name: p.name,
                description: p.description,
                url: p.url
            };
        });
        let listSkill = [];
        for (let i = 0; i < applicant.get('candidateId.skills').length; i++) {
            listSkill.push({ label: applicant.get('candidateId.skills')[i].skillId.name, value: i });
        }
        const returnApplicant = {
            candidateId: applicant.candidateId._id.toString(),
            blackList: applicant.get('candidateId.blackList'),
            avatar: applicant.get('candidateId.avatar.url'),
            candidateFullName: applicant.get('candidateId.fullName'),
            candidateEmail: applicant.get('candidateId.email'),
            interviewerFullNames: [],
            score: null,
            state: 'NOT_RECEIVED',
            dateOfBirth: applicant.get('candidateId.dateOfBirth'),
            address: applicant.get('candidateId.address'),
            phone: applicant.get('candidateId.phone'),
            information: {
                education: returnEducationList,
                experience: returnExperienceList,
                certificate: returnCertificateList,
                project: returnProjectList,
                skills: listSkill
            }
        };
        res.status(200).json({ success: true, message: 'Successfully', result: returnApplicant });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        next(err);
    }
};
exports.getSingleApplicantsJob = getSingleApplicantsJob;
const createMeeting = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyToken)(accessToken);
        const recruiter = await user_1.User.findById(decodedToken.userId).populate('roleId');
        if (recruiter?.get('roleId.roleName') !== 'RECRUITER') {
            const error = new Error('UnAuthorized');
            error.statusCode = 401;
            error.result = null;
            throw error;
        }
        ;
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
        const candidate = await user_1.User.findById(candidateId);
        if (!candidate) {
            const error = new Error('Không tìm thấy candidate');
            error.statusCode = 409;
            error.result = null;
            throw error;
        }
        const jobId = await job_1.Job.findById(jobApplyId);
        if (!jobId) {
            const error = new Error('Không tìm thấy Job');
            error.statusCode = 409;
            error.result = null;
            throw error;
        }
        const jobApply = await jobApply_1.JobApply.findOne({ candidateId: candidateId, jobAppliedId: jobApplyId });
        if (!jobApply) {
            const error = new Error('Không tìm thấy Job Apply');
            error.statusCode = 409;
            error.result = null;
            throw error;
        }
        const clientId = 'ef86ecc5-3294-4b4d-986e-d0377dc29b20';
        const tenantId = '1f74f109-07f6-4291-81bc-64bc4acbd48a';
        const clientSecret = `${process.env.CLIENT_SECRET}`;
        const scopes = ["https://graph.microsoft.com/.default"];
        const credentialOptions = {
            authorityHost: "https://login.microsoftonline.com",
        };
        const credential = new identity_1.ClientSecretCredential(tenantId, clientId, clientSecret, credentialOptions);
        const graphClient = GraphClient.Client.init({
            authProvider: (done) => {
                credential
                    .getToken(scopes)
                    .then((tokenResponse) => {
                    const token = tokenResponse?.token;
                    if (token) {
                        done(null, token);
                    }
                    else {
                        done(new Error("Failed to retrieve access token"), null);
                    }
                })
                    .catch((error) => done(error, null));
            },
        });
        const startDateTime = new Date(time);
        const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);
        const onlineMeeting = {
            startDateTime: startDateTime.toISOString(),
            endDateTime: endDateTime.toISOString(),
            subject: 'Interview',
            lobbyBypassSettings: {
                scope: 'everyone',
                isDialInBypassEnabled: true,
            },
        };
        const result = await graphClient
            .api(`/users/021e095b-02f2-4e67-9ea8-a1fbe63d77ae/onlineMeetings`)
            .post(onlineMeeting);
        console.log(result);
        const meetingUrl = result.joinWebUrl;
        const interview = new interview_1.Interview({
            candidateId: candidateId,
            jobApplyId: jobApplyId,
            time: startDateTime.toISOString(),
            interviewLink: meetingUrl,
            state: 'PENDING'
        });
        await interview.save();
        const interviewerInterview = new interviewerInterview_1.InterviewerInterview({
            interviewersId: interviewersId,
            interviewId: interview._id.toString()
        });
        await interviewerInterview.save();
        jobApply.status = "REVIEWING";
        await jobApply.save();
        const candidateCV = await resumeUpload_1.ResumeUpload.findOne({ candidateId: candidateId });
        let interviewersMail = [];
        let interviewersName = [];
        for (let i = 0; i < interviewersId.length; i++) {
            const interviewer = await user_1.User.findById(interviewersId[i].toString());
            if (!interviewer) {
                const error = new Error('Không tìm thấy interviewer');
                error.statusCode = 409;
                error.result = null;
                throw error;
            }
            interviewersMail.push(interviewer.email);
            interviewersName.push(interviewer.fullName);
        }
        let attendees = interviewersMail.concat(candidate.email);
        let mailDetails = {
            from: 'nguyennghia193913@gmail.com',
            cc: attendees.join(','),
            subject: 'Interview Information',
            html: ` 
            <div style="display: flex; justify-content: space-around">
                <div>
                    <div style="display: flex; justify-content: center">
                        <h2 style="color:blue; text-align: center;">Interview Information</h2>
                    </div>
                    <p>Dear ${candidate.fullName}</p>
                    <p>Thank you for applying to Job Port.</p>
                    <p>We've reviewed your application materials and we're excited to invite you to interview for the role.</p>
                    <p>Your interview will be conducted via online meeting with ${recruiter.fullName} (Recruiter).</p>
                    <p>The interview time is on ${(0, utils_1.formatDateToJSDateObject)(startDateTime)}.</p>
                    <p>If you have any questions, please don't hesitate to contact us.</p>
                    <p>Regard, ${recruiter.fullName}.</p>
                    <p><b>Start Date:</b> ${(0, utils_1.formatDateToJSDateObject)(startDateTime)}</p>
                    <p><b>Candidate:</b> ${candidate.fullName} (${candidate.email})</p>
                    <p><b>Recruiter:</b> ${recruiter.fullName} (${recruiter.email})</p>
                    <b>Interviewer:</b>
                    ${interviewersMail.map((email, index) => `
                        <p>${interviewersName[index]} (${email})</p>
                    `).join('')}
                </div>
                
                <div>
                    <h2 style="color:blue; text-align: center;">Join the Meeting</h2>
                    <div style="text-align: center">
                        <button style="background-color: #008000; padding: 10px 50px; border-radius: 5px; border-style: none;"><a href="${meetingUrl}" style="font-size: 15px;color: white; text-decoration: none">Join Now</a></button>
                    </div>
                    <p><b>Description:</b> Job: N&T</p>
                    <p><b>Link applicant CV:</b> <a href="${candidateCV?.resumeUpload}">Download CV</a></p>
                </div>
            </div>
            `,
            attachments: [
                {
                    filename: 'invitation.ics',
                    content: createICalEvent(startDateTime, endDateTime, attendees),
                    encoding: 'base64'
                }
            ]
        };
        utils_1.transporter.sendMail(mailDetails, err => {
            const error = new Error('Gửi mail thất bại');
            throw error;
        });
        res.status(200).json({ success: true, message: 'Successfully', result: null });
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
function createICalEvent(startTime, endTime, attendees) {
    const startISOString = startTime.toISOString();
    const endISOString = endTime.toISOString();
    const attendeesString = attendees.map(attendee => `ATTENDEE:${attendee}`).join('\r\n');
    const iCalString = `
        BEGIN:VCALENDAR
        VERSION:2.0
        BEGIN:VEVENT
        DTSTART:${startISOString}
        DTEND:${endISOString}
        ${attendeesString}
        END:VEVENT
        END:VCALENDAR
    `;
    return iCalString;
}
