import { Event } from "../models/event";
import { Interview } from "../models/interview";
import { Job } from "../models/job";
import { JobApply } from "../models/jobApply";
import { User } from "../models/user";

export const recruiterStatistics = async (recruiterId: string) => {
    const recruiter = await User.findById(recruiterId).populate('roleId');
    if (recruiter?.get('roleId.roleName') !== 'RECRUITER') {
        const error: Error & { statusCode?: number, result?: any } = new Error('UnAuthorized');
        error.statusCode = 401;
        error.result = null;
        throw error;
    }
    const jobNumber = await Job.find({ authorId: recruiter._id.toString() }).countDocuments();
    const eventNumber = await Event.find({ authorId: recruiter._id.toString() }).countDocuments();
    const interviewNumber = await Interview.find({ authorId: recruiter._id.toString() }).countDocuments();
    const candidatePassNumber = await JobApply.find({ authorId: recruiter._id.toString(), status: 'PASS' }).countDocuments();
    return { jobNumber, eventNumber, interviewNumber, candidatePassNumber };
}