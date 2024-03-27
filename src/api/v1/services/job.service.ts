import { Job } from "../models/job";
import { jobLocation, jobPosition, jobType } from "../utils";

export const getJobs = async (name: any, type: any, position: any, location: any, page: number, limit: number) => {
    const query: any = {
        isActive: true,
        deadline: { $gt: new Date() }
    };
    if (name) {
        query['name'] = new RegExp(name, 'i');
    };
    if (type) {
        query['type'] = type;
    };
    if (position) {
        query['position'] = position;
    };
    if (location) {
        query['location'] = location;
    };
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
    const jobs = await Job.find(query).populate('authorId')
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
            author: (job.authorId as any).name,
            position: job.position,
            location: job.location,
            jobType: job.type,
            skills: job.skills
        };
    });
    return { listjobs, jobLength };
}

export const getLocation = () => {
    return jobLocation;
}

export const getPosition = () => {
    return jobPosition;
}

export const getType = () => {
    return jobType;
}

export const getSingleJob = async (jobId: string) => {
    return await (Job as any).getJobDetail(jobId);
}