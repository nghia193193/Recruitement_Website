"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobService = void 0;
const job_1 = require("../models/job");
const utils_1 = require("../utils");
exports.jobService = {
    getJobs: async (name, type, position, location, page, limit) => {
        const query = {
            isActive: true,
            deadline: { $gt: new Date() }
        };
        if (name) {
            query['name'] = new RegExp(name, 'i');
        }
        ;
        if (type) {
            query['type'] = type;
        }
        ;
        if (position) {
            query['position'] = position;
        }
        ;
        if (location) {
            query['location'] = location;
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
        const jobs = await job_1.Job.find(query).populate('authorId')
            .sort({ updatedAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);
        const listjobs = jobs.map(job => {
            return {
                jobId: job._id.toString(),
                name: job.name,
                quantity: job.quantity,
                benefit: job.benefit,
                salaryRange: job.salaryRange,
                requirement: job.requirement,
                description: job.description,
                author: job.authorId.name,
                position: job.position,
                location: job.location,
                jobType: job.type,
                skills: job.skills
            };
        });
        return { listjobs, jobLength };
    },
    getLocation: () => {
        return utils_1.jobLocation;
    },
    getPosition: () => {
        return utils_1.jobPosition;
    },
    getType: () => {
        return utils_1.jobType;
    },
    getSingleJob: async (jobId) => {
        return await job_1.Job.getJobDetail(jobId);
    }
};
