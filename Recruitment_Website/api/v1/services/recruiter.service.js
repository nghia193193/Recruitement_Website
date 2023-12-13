"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recruiterStatistics = void 0;
const event_1 = require("../models/event");
const interview_1 = require("../models/interview");
const job_1 = require("../models/job");
const jobApply_1 = require("../models/jobApply");
const user_1 = require("../models/user");
const recruiterStatistics = async (recruiterId) => {
    const recruiter = await user_1.User.findById(recruiterId).populate('roleId');
    if (recruiter?.get('roleId.roleName') !== 'RECRUITER') {
        const error = new Error('UnAuthorized');
        error.statusCode = 401;
        error.result = null;
        throw error;
    }
    const jobNumber = await job_1.Job.find({ authorId: recruiter._id.toString() }).countDocuments();
    const eventNumber = await event_1.Event.find({ authorId: recruiter._id.toString() }).countDocuments();
    const interviewNumber = await interview_1.Interview.find({ authorId: recruiter._id.toString() }).countDocuments();
    const candidatePassNumber = await jobApply_1.JobApply.find({ authorId: recruiter._id.toString(), status: 'PASS' }).countDocuments();
    return { jobNumber, eventNumber, interviewNumber, candidatePassNumber };
};
exports.recruiterStatistics = recruiterStatistics;
