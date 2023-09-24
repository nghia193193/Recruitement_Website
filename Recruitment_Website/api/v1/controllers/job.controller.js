"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSingleJob = exports.getType = exports.getPos = exports.getLoc = exports.getJobs = void 0;
const job_1 = require("../models/job");
const jobPosition_1 = require("../models/jobPosition");
const skill_1 = require("../models/skill");
const express_validator_1 = require("express-validator");
const getJobs = async (req, res, next) => {
    const page = req.query.page ? +req.query.page : 1;
    const limit = req.query.limit ? +req.query.limit : 10;
    const errors = (0, express_validator_1.validationResult)(req);
    try {
        if (!errors.isEmpty()) {
            const error = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = {
                content: []
            };
            throw error;
        }
        ;
        const query = {};
        const optionalQuerys = ['name', 'type', 'location', 'position'];
        for (const q of optionalQuerys) {
            if (q === 'type') {
                if (req.query[q]) {
                    query['jobType'] = req.query[q];
                }
                ;
            }
            else if (q === 'position') {
                if (req.query[q]) {
                    const jobPos = await jobPosition_1.JobPosition.findOne({ name: req.query[q] });
                    query['positionId'] = jobPos?._id;
                }
                ;
            }
            else {
                if (req.query[q]) {
                    query[q] = req.query[q];
                }
                ;
            }
            ;
        }
        ;
        const skill = await skill_1.Skill.find();
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
        const jobs = await job_1.Job.find(query).populate('positionId skills.skillId')
            .skip((page - 1) * limit)
            .limit(limit);
        const listjobs = jobs.map(job => {
            const { _id, skills, positionId, ...rest } = job;
            delete rest._doc._id;
            delete rest._doc.skills;
            delete rest._doc.positionId;
            const listSkills = skills.map(skill => {
                return skill.skillId.name;
            });
            return {
                jobId: _id.toString(),
                position: positionId.name,
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
        ;
        next(err);
    }
    ;
};
exports.getJobs = getJobs;
const getLoc = async (req, res, next) => {
    try {
        const jobs = await job_1.Job.find();
        let listLocation = jobs.map(job => {
            return job.location;
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
exports.getLoc = getLoc;
const getPos = async (req, res, next) => {
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
exports.getPos = getPos;
const getType = async (req, res, next) => {
    try {
        const jobs = await job_1.Job.find();
        let listType = jobs.map(job => {
            return job.jobType;
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
exports.getType = getType;
const getSingleJob = async (req, res, next) => {
    const jobId = req.params.jobId;
    const errors = (0, express_validator_1.validationResult)(req);
    try {
        if (!errors.isEmpty()) {
            const error = new Error(errors.array()[0].msg);
            error.statusCode = 422;
            error.result = null;
            throw error;
        }
        ;
        const job = await job_1.Job.findById(jobId).populate('positionId skills.skillId');
        if (!job) {
            const error = new Error('Không tìm thấy job');
            error.statusCode = 404;
            error.result = null;
            throw error;
        }
        ;
        const { _id, skills, positionId, ...rest } = job;
        delete rest._doc._id;
        delete rest._doc.skills;
        delete rest._doc.positionId;
        const listSkills = skills.map(skill => {
            return skill.skillId.name;
        });
        const returnJob = {
            jobId: _id.toString(),
            position: positionId.name,
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
exports.getSingleJob = getSingleJob;
