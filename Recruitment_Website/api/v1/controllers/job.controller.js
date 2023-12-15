"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetSingleJob = exports.GetType = exports.GetPosition = exports.GetLocation = exports.GetJobs = void 0;
const job_1 = require("../models/job");
const jobPosition_1 = require("../models/jobPosition");
const express_validator_1 = require("express-validator");
const jobLocation_1 = require("../models/jobLocation");
const jobType_1 = require("../models/jobType");
const GetJobs = async (req, res, next) => {
    try {
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
        ;
        const query = {
            isActive: true,
            deadline: { $gt: new Date() }
        };
        if (req.query['name']) {
            query['name'] = new RegExp(req.query['name'], 'i');
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
        res.status(200).json({
            success: true, message: 'Successfully', statusCode: 200, result: {
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
        ;
        next(err);
    }
    ;
};
exports.GetJobs = GetJobs;
const GetLocation = async (req, res, next) => {
    try {
        const jobs = await jobLocation_1.JobLocation.find();
        let listLocation = jobs.map(job => {
            return job.name;
        });
        listLocation = [...new Set(listLocation)];
        res.status(200).json({ success: true, message: 'Lấy list Location thành công', statusCode: 200, result: listLocation });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        ;
        next(err);
    }
    ;
};
exports.GetLocation = GetLocation;
const GetPosition = async (req, res, next) => {
    try {
        const jobPos = await jobPosition_1.JobPosition.find();
        let listPosition = jobPos.map(job => {
            return job.name;
        });
        listPosition = [...new Set(listPosition)];
        res.status(200).json({ success: true, message: 'Lấy list Position thành công', statusCode: 200, result: listPosition });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        ;
        next(err);
    }
    ;
};
exports.GetPosition = GetPosition;
const GetType = async (req, res, next) => {
    try {
        const jobs = await jobType_1.JobType.find();
        let listType = jobs.map(job => {
            return job.name;
        });
        listType = [...new Set(listType)];
        res.status(200).json({ success: true, message: 'Lấy list Type thành công', statusCode: 200, result: listType });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        ;
        next(err);
    }
    ;
};
exports.GetType = GetType;
const GetSingleJob = async (req, res, next) => {
    try {
        const jobId = req.params.jobId;
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            const error = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        ;
        const job = await job_1.Job.findById(jobId).populate('positionId locationId typeId skills.skillId');
        if (!job) {
            const error = new Error('Không tìm thấy job');
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        ;
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
        res.status(200).json({ success: true, message: 'Đã tìm thấy job', statusCode: 200, result: returnJob });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        ;
        next(err);
    }
    ;
};
exports.GetSingleJob = GetSingleJob;
