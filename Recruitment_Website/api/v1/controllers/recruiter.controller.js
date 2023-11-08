"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAllInterviewers = exports.DeleteEvent = exports.UpdateEvent = exports.CreateEvent = exports.GetSingleEvent = exports.GetAllEvents = exports.DeleteJob = exports.UpdateJob = exports.GetSingleJob = exports.CreateJob = exports.GetAllJobs = void 0;
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
const GetAllJobs = async (req, res, next) => {
    const authHeader = req.get('Authorization');
    const accessToken = authHeader.split(' ')[1];
    try {
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
    const authHeader = req.get('Authorization');
    const accessToken = authHeader.split(' ')[1];
    const { name, jobType, quantity, benefit, salaryRange, requirement, location, description, deadline, position, skillRequired } = req.body;
    const errors = (0, express_validator_1.validationResult)(req);
    try {
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
    const authHeader = req.get('Authorization');
    const accessToken = authHeader.split(' ')[1];
    const jobId = req.params.jobId;
    const errors = (0, express_validator_1.validationResult)(req);
    try {
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
        const job = await job_1.Job.findOne({ authorId: recruiter._id, _id: jobId }).populate('positionId locationId typeId skills.skillId');
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
    const authHeader = req.get('Authorization');
    const accessToken = authHeader.split(' ')[1];
    const jobId = req.params.jobId;
    const { name, jobType, quantity, benefit, salaryRange, requirement, location, description, deadline, position, skillRequired } = req.body;
    const errors = (0, express_validator_1.validationResult)(req);
    try {
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
    const authHeader = req.get('Authorization');
    const accessToken = authHeader.split(' ')[1];
    const jobId = req.params.jobId;
    const errors = (0, express_validator_1.validationResult)(req);
    try {
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
    const authHeader = req.get('Authorization');
    const accessToken = authHeader.split(' ')[1];
    try {
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
    const authHeader = req.get('Authorization');
    const accessToken = authHeader.split(' ')[1];
    try {
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
    const authHeader = req.get('Authorization');
    const accessToken = authHeader.split(' ')[1];
    try {
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
    const authHeader = req.get('Authorization');
    const accessToken = authHeader.split(' ')[1];
    try {
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
    const authHeader = req.get('Authorization');
    const accessToken = authHeader.split(' ')[1];
    try {
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
    const authHeader = req.get('Authorization');
    const accessToken = authHeader.split(' ')[1];
    try {
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
        const { name } = req.query;
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
            query['name'] = req.query['name'];
        }
        ;
        console.log(query);
        const interviewerList = await user_1.User.find(query).populate('roleId')
            .skip((page - 1) * limit)
            .limit(limit);
        console.log(interviewerList);
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
exports.GetAllInterviewers = GetAllInterviewers;
