"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSingleJob = exports.getType = exports.getPosition = exports.getLocation = exports.getJobs = void 0;
const job_1 = require("../models/job");
const jobLocation_1 = require("../models/jobLocation");
const jobPosition_1 = require("../models/jobPosition");
const jobType_1 = require("../models/jobType");
const getJobs = async (query, page, limit) => {
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
    return { listjobs, jobLength };
};
exports.getJobs = getJobs;
const getLocation = async () => {
    const jobs = await jobLocation_1.JobLocation.find();
    let listLocation = jobs.map(job => {
        return job.name;
    });
    listLocation = [...new Set(listLocation)];
    return listLocation;
};
exports.getLocation = getLocation;
const getPosition = async () => {
    const jobPos = await jobPosition_1.JobPosition.find();
    let listPosition = jobPos.map(job => {
        return job.name;
    });
    listPosition = [...new Set(listPosition)];
    return listPosition;
};
exports.getPosition = getPosition;
const getType = async () => {
    const jobs = await jobType_1.JobType.find();
    let listType = jobs.map(job => {
        return job.name;
    });
    listType = [...new Set(listType)];
    return listType;
};
exports.getType = getType;
const getSingleJob = async (jobId) => {
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
    return returnJob;
};
exports.getSingleJob = getSingleJob;
