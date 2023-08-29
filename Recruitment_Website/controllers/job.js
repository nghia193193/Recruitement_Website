"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJobs = void 0;
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
        }
        next(err);
    }
};
exports.getJobs = getJobs;
