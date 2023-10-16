"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteJob = exports.UpdateJob = exports.GetSingleJob = exports.CreateJob = exports.GetAllJobs = void 0;
const utils_1 = require("../utils");
const express_validator_1 = require("express-validator");
const user_1 = require("../models/user");
const jobPosition_1 = require("../models/jobPosition");
const job_1 = require("../models/job");
const jobType_1 = require("../models/jobType");
const jobLocation_1 = require("../models/jobLocation");
const skill_1 = require("../models/skill");
const GetAllJobs = async (req, res, next) => {
    const authHeader = req.get('Authorization');
    const accessToken = authHeader.split(' ')[1];
    try {
        const decodedToken = await (0, utils_1.verifyToken)(accessToken);
        const recruiter = await user_1.User.findOne({ email: decodedToken.email }).populate('roleId');
        if (!recruiter) {
            const error = new Error('Không tìm thấy user');
            error.statusCode = 409;
            throw error;
        }
        ;
        if (recruiter.get('roleId.roleName') !== 'RECRUITER') {
            const error = new Error('UnAuthorized');
            error.statusCode = 401;
            throw error;
        }
        ;
        const page = req.query.page ? +req.query.page : 1;
        const limit = req.query.limit ? +req.query.limit : 10;
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            const error = new Error(errors.array()[0].msg);
            error.statusCode = 400;
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
        const recruiter = await user_1.User.findOne({ email: decodedToken.email }).populate('roleId');
        if (!recruiter) {
            const error = new Error('Không tìm thấy user');
            error.statusCode = 409;
            throw error;
        }
        ;
        if (recruiter.get('roleId.roleName') !== 'RECRUITER') {
            const error = new Error('UnAuthorized');
            error.statusCode = 401;
            throw error;
        }
        ;
        if (!errors.isEmpty()) {
            const error = new Error(errors.array()[0].msg);
            error.statusCode = 400;
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
        res.status(200).json({ success: true, message: "Tạo job thành công" });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
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
        const recruiter = await user_1.User.findOne({ email: decodedToken.email }).populate('roleId');
        if (!recruiter) {
            const error = new Error('Không tìm thấy user');
            error.statusCode = 409;
            throw error;
        }
        ;
        if (recruiter.get('roleId.roleName') !== 'RECRUITER') {
            const error = new Error('UnAuthorized');
            error.statusCode = 401;
            throw error;
        }
        ;
        if (!errors.isEmpty()) {
            const error = new Error(errors.array()[0].msg);
            error.statusCode = 400;
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
        const recruiter = await user_1.User.findOne({ email: decodedToken.email }).populate('roleId');
        if (!recruiter) {
            const error = new Error('Không tìm thấy user');
            error.statusCode = 409;
            throw error;
        }
        ;
        if (recruiter.get('roleId.roleName') !== 'RECRUITER') {
            const error = new Error('UnAuthorized');
            error.statusCode = 401;
            throw error;
        }
        ;
        if (!errors.isEmpty()) {
            const error = new Error(errors.array()[0].msg);
            error.statusCode = 400;
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
        res.status(200).json({ sucess: true, message: 'Update job thành công' });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
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
        const recruiter = await user_1.User.findOne({ email: decodedToken.email }).populate('roleId');
        if (!recruiter) {
            const error = new Error('Không tìm thấy user');
            error.statusCode = 409;
            throw error;
        }
        ;
        if (recruiter.get('roleId.roleName') !== 'RECRUITER') {
            const error = new Error('UnAuthorized');
            error.statusCode = 401;
            throw error;
        }
        ;
        if (!errors.isEmpty()) {
            const error = new Error(errors.array()[0].msg);
            error.statusCode = 400;
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
        res.status(200).json({ sucess: true, message: 'Xóa job thành công' });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};
exports.DeleteJob = DeleteJob;
