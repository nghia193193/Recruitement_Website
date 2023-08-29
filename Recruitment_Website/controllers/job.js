"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSingleJob = exports.getType = exports.getPos = exports.getLoc = exports.getJobs = void 0;
const job_1 = require("../models/job");
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
                type: "about:blank",
                title: "Bad request",
                instance: "/api/v1/jobs"
            };
            throw error;
        }
        const query = {};
        const optionalQuerys = ['name', 'type', 'location'];
        for (const q of optionalQuerys) {
            if (q === 'type') {
                if (req.query[q]) {
                    query['jobType'] = req.query[q];
                }
            }
            else {
                if (req.query[q]) {
                    query[q] = req.query[q];
                }
            }
            ;
        }
        ;
        // console.log(query);
        if (req.query.position) {
            const jobLength = await job_1.Job.find({ ...query, 'position.name': req.query.position }).countDocuments();
            const jobs = await job_1.Job.find({ ...query, 'position.name': req.query.position })
                .skip((page - 1) * limit)
                .limit(limit);
            const listjobs = jobs.map(job => {
                const { _id: jobId, ...rest } = job;
                const { _id, skills, position, ...r } = rest._doc;
                position.positionId = position.positionId.toString();
                const listSkills = skills.map((skill) => {
                    const { _id, name } = skill;
                    return {
                        skillId: _id.toString(),
                        name: name
                    };
                });
                return {
                    jobId: jobId.toString(),
                    skills: listSkills,
                    position,
                    ...r
                };
            });
            console.log(listjobs);
            res.status(200).json({ success: true, message: 'Successfully', statusCode: 200, result: {
                    pageNumber: page,
                    totalPages: Math.ceil(jobLength / limit),
                    limit: limit,
                    totalElements: jobLength,
                    content: listjobs
                } });
        }
        else {
            const jobLength = await job_1.Job.find(query).countDocuments();
            const jobs = await job_1.Job.find(query)
                .skip((page - 1) * limit)
                .limit(limit);
            const listjobs = jobs.map(job => {
                const { _id: jobId, ...rest } = job;
                const { _id, skills, position, ...r } = rest._doc;
                position.positionId = position.positionId.toString();
                const listSkills = skills.map((skill) => {
                    const { _id, name } = skill;
                    return {
                        skillId: _id.toString(),
                        name: name
                    };
                });
                return {
                    jobId: jobId.toString(),
                    skills: listSkills,
                    position,
                    ...r
                };
            });
            console.log(listjobs);
            res.status(200).json({ success: true, message: 'Successfully', statusCode: 200, result: {
                    pageNumber: page,
                    totalPages: Math.ceil(jobLength / limit),
                    limit: limit,
                    totalElements: jobLength,
                    content: listjobs
                } });
        }
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        next(err);
    }
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
        next(err);
    }
};
exports.getLoc = getLoc;
const getPos = async (req, res, next) => {
    try {
        const jobs = await job_1.Job.find();
        let listPosition = jobs.map(job => {
            return job.get('position.name');
        });
        listPosition = [...new Set(listPosition)];
        res.status(200).json({ success: true, message: 'Lấy list Position thành công', statusCode: 200, result: listPosition });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        next(err);
    }
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
        next(err);
    }
};
exports.getType = getType;
const getSingleJob = async (req, res, next) => {
    const jobId = req.params.jobId;
    try {
        const job = await job_1.Job.findById(jobId);
        if (!job) {
            const error = new Error('Không tìm thấy job');
            error.statusCode = 404;
            error.result = null;
            throw error;
        }
        job.set('position.positionId', job.get('position.positionId').toString());
        const { _id: jId, ...rest } = job;
        const { _id, skills, position, ...r } = rest._doc;
        position.positionId = position.positionId.toString();
        const listSkills = skills.map((skill) => {
            const { _id, name } = skill;
            return {
                skillId: _id.toString(),
                name: name
            };
        });
        const returnJob = {
            jobId: jId.toString(),
            position,
            listSkills,
            ...r
        };
        res.status(200).json({ success: true, message: 'Đã tìm thấy job', statusCode: 200, result: returnJob });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        next(err);
    }
};
exports.getSingleJob = getSingleJob;
