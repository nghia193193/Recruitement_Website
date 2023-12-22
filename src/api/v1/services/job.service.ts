import { Job } from "../models/job";
import { JobLocation } from "../models/jobLocation";
import { JobPosition } from "../models/jobPosition";
import { JobType } from "../models/jobType";

export const getJobs = async (query: any, page: number, limit: number) => {
    const jobLength = await Job.find(query).countDocuments();
    if (jobLength === 0) {
        const error: Error & { statusCode?: any, success?: any, result?: any } = new Error('Không tìm thấy job');
        error.statusCode = 200;
        error.success = true;
        error.result = {
            content: []
        };
        throw error;
    };
    const jobs = await Job.find(query).populate('positionId locationId typeId skills.skillId')
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
    const listjobs = jobs.map(job => {
        const { _id, skills, positionId, locationId, typeId, ...rest } = job;
        delete (rest as any)._doc._id;
        delete (rest as any)._doc.skills;
        delete (rest as any)._doc.positionId;
        delete (rest as any)._doc.locationId;
        delete (rest as any)._doc.typeId;
        const listSkills = skills.map(skill => {
            return (skill as any).skillId.name
        });
        return {
            jobId: _id.toString(),
            position: (positionId as any).name,
            location: (locationId as any).name,
            jobType: (typeId as any).name,
            ...(rest as any)._doc,
            skills: listSkills
        };
    });
    return { listjobs, jobLength };
}

export const getLocation = async () => {
    const jobs = await JobLocation.find();
    let listLocation = jobs.map(job => {
        return job.name;
    });
    listLocation = [...new Set(listLocation)];
    return listLocation;
}

export const getPosition = async () => {
    const jobPos = await JobPosition.find();
    let listPosition = jobPos.map(job => {
        return job.name;
    });
    listPosition = [...new Set(listPosition)];
    return listPosition;
}

export const getType = async () => {
    const jobs = await JobType.find();
    let listType = jobs.map(job => {
        return job.name;
    });
    listType = [...new Set(listType)];
    return listType;
}

export const getSingleJob = async (jobId: string) => {
    const job = await Job.findById(jobId).populate('positionId locationId typeId skills.skillId');
    if (!job) {
        const error: Error & { statusCode?: any, result?: any } = new Error('Không tìm thấy job');
        error.statusCode = 400;
        error.result = null;
        throw error;
    };
    const { _id, skills, positionId, locationId, typeId, ...rest } = job;
    delete (rest as any)._doc._id;
    delete (rest as any)._doc.skills;
    delete (rest as any)._doc.positionId;
    delete (rest as any)._doc.locationId;
    delete (rest as any)._doc.typeId;
    const listSkills = skills.map(skill => {
        return (skill as any).skillId.name
    });
    const returnJob = {
        jobId: _id.toString(),
        position: (positionId as any).name,
        location: (locationId as any).name,
        jobType: (typeId as any).name,
        ...(rest as any)._doc,
        skills: listSkills
    };
    return returnJob;
}