"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.recruiterStatistics = exports.getInterviewsOfInterviewer = exports.getInterviewsOfCandidate = exports.getJobSuggestedCandidates = exports.updateCandidateState = exports.createMeeting = exports.getSingleApplicantJob = exports.getApplicantsJob = exports.getSingleApplicant = exports.getAllApplicants = exports.getSingleInterviewer = exports.getAllInterviewers = exports.deleteEvent = exports.updateEvent = exports.createEvent = exports.getSingleEvent = exports.getAllEvents = exports.deleteJob = exports.updateJob = exports.getSingleJob = exports.createJob = exports.getAllJobs = void 0;
const cloudinary_1 = require("cloudinary");
const event_1 = require("../models/event");
const interview_1 = require("../models/interview");
const job_1 = require("../models/job");
const jobApply_1 = require("../models/jobApply");
const jobLocation_1 = require("../models/jobLocation");
const jobPosition_1 = require("../models/jobPosition");
const jobType_1 = require("../models/jobType");
const skill_1 = require("../models/skill");
const user_1 = require("../models/user");
const role_1 = require("../models/role");
const education_1 = require("../models/education");
const experience_1 = require("../models/experience");
const project_1 = require("../models/project");
const certificate_1 = require("../models/certificate");
const mongoose_1 = __importDefault(require("mongoose"));
const interviewerInterview_1 = require("../models/interviewerInterview");
const questionCandidate_1 = require("../models/questionCandidate");
const utils_1 = require("../utils");
const identity_1 = require("@azure/identity");
const GraphClient = __importStar(require("@microsoft/microsoft-graph-client"));
const getAllJobs = async (recruiterId, name, type, position, location, active, page, limit) => {
    const recruiter = await user_1.User.findById(recruiterId).populate('roleId');
    if (!recruiter) {
        const error = new Error('Không tìm thấy user');
        error.statusCode = 409;
        error.result = null;
        throw error;
    }
    ;
    if (recruiter.get('roleId.roleName') !== 'RECRUITER') {
        const error = new Error('UnAuthorized');
        error.statusCode = 401;
        error.result = {
            content: []
        };
        throw error;
    }
    ;
    const query = {
        authorId: recruiterId,
    };
    switch (active) {
        case undefined:
            query['isActive'] = true;
            query['deadline'] = { $gt: new Date() };
            break;
        case 'false':
            query['$or'] = [
                { deadline: { $lt: new Date() } },
                { isActive: false }
            ];
            break;
        case 'true':
            query['isActive'] = true;
            query['deadline'] = { $gt: new Date() };
    }
    if (name) {
        query['name'] = new RegExp(name, 'i');
    }
    ;
    if (type) {
        const jobType = await jobType_1.JobType.findOne({ name: type });
        query['typeId'] = jobType?._id;
    }
    ;
    if (position) {
        const jobPos = await jobPosition_1.JobPosition.findOne({ name: position });
        query['positionId'] = jobPos?._id;
    }
    ;
    if (location) {
        const jobLoc = await jobLocation_1.JobLocation.findOne({ name: location });
        query['locationId'] = jobLoc?._id;
    }
    ;
    console.log(query);
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
exports.getAllJobs = getAllJobs;
const createJob = async (recruiterId, name, position, jobType, quantity, benefit, salaryRange, requirement, location, description, deadline, skillRequired) => {
    const recruiter = await user_1.User.findById(recruiterId).populate('roleId');
    if (!recruiter) {
        const error = new Error('Không tìm thấy user');
        error.statusCode = 409;
        error.result = null;
        throw error;
    }
    ;
    if (recruiter.get('roleId.roleName') !== 'RECRUITER') {
        const error = new Error('UnAuthorized');
        error.statusCode = 401;
        error.result = null;
        throw error;
    }
    ;
    const existJob = await job_1.Job.findOne({ name: name });
    if (existJob) {
        const error = new Error('Tên job này đã tồn tại vui lòng nhập tên khác');
        error.statusCode = 409;
        error.result = null;
        throw error;
    }
    const pos = await jobPosition_1.JobPosition.findOne({ name: position });
    const type = await jobType_1.JobType.findOne({ name: jobType });
    const loc = await jobLocation_1.JobLocation.findOne({ name: location });
    let listSkill = [];
    for (let skill of skillRequired) {
        const s = await skill_1.Skill.findOne({ name: skill });
        listSkill.push({ skillId: s._id });
    }
    ;
    const job = new job_1.Job({
        name: name,
        positionId: pos._id.toString(),
        typeId: type._id.toString(),
        authorId: recruiter._id.toString(),
        quantity: +quantity,
        benefit: benefit,
        salaryRange: salaryRange,
        requirement: requirement,
        locationId: loc._id.toString(),
        description: description,
        isActive: true,
        deadline: deadline,
        skills: listSkill
    });
    await job.save();
};
exports.createJob = createJob;
const getSingleJob = async (recruiterId, jobId) => {
    const recruiter = await user_1.User.findById(recruiterId).populate('roleId');
    if (!recruiter) {
        const error = new Error('Không tìm thấy user');
        error.statusCode = 409;
        error.result = null;
        throw error;
    }
    ;
    if (recruiter.get('roleId.roleName') !== 'RECRUITER') {
        const error = new Error('UnAuthorized');
        error.statusCode = 401;
        error.result = null;
        throw error;
    }
    ;
    const job = await job_1.Job.findOne({ authorId: recruiter._id, _id: jobId })
        .populate('positionId locationId typeId skills.skillId');
    if (!job) {
        const error = new Error('Không tìm thấy job');
        error.statusCode = 409;
        error.result = null;
        throw error;
    }
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
const updateJob = async (recruiterId, jobId, name, position, jobType, quantity, benefit, salaryRange, requirement, location, description, deadline, skillRequired) => {
    const recruiter = await user_1.User.findById(recruiterId).populate('roleId');
    if (!recruiter) {
        const error = new Error('Không tìm thấy user');
        error.statusCode = 409;
        error.result = null;
        throw error;
    }
    ;
    if (recruiter.get('roleId.roleName') !== 'RECRUITER') {
        const error = new Error('UnAuthorized');
        error.statusCode = 401;
        error.result = null;
        throw error;
    }
    ;
    const pos = await jobPosition_1.JobPosition.findOne({ name: position });
    const type = await jobType_1.JobType.findOne({ name: jobType });
    const loc = await jobLocation_1.JobLocation.findOne({ name: location });
    let listSkill = [];
    for (let skill of skillRequired) {
        const s = await skill_1.Skill.findOne({ name: skill });
        listSkill.push({ skillId: s._id });
    }
    ;
    const job = await job_1.Job.findOne({ authorId: recruiter._id, _id: jobId });
    if (!job) {
        const error = new Error('Không tìm thấy job');
        error.statusCode = 409;
        error.result = null;
        throw error;
    }
    ;
    job.name = name;
    job.positionId = pos._id.toString();
    job.typeId = type._id.toString();
    job.quantity = +quantity;
    job.benefit = benefit;
    job.salaryRange = salaryRange;
    job.requirement = requirement;
    job.locationId = loc._id.toString();
    job.description = description;
    job.deadline = deadline;
    job.skills = listSkill;
    await job.save();
};
exports.updateJob = updateJob;
const deleteJob = async (recruiterId, jobId) => {
    const recruiter = await user_1.User.findById(recruiterId).populate('roleId');
    if (!recruiter) {
        const error = new Error('Không tìm thấy user');
        error.statusCode = 409;
        error.result = null;
        throw error;
    }
    ;
    if (recruiter.get('roleId.roleName') !== 'RECRUITER') {
        const error = new Error('UnAuthorized');
        error.statusCode = 401;
        error.result = null;
        throw error;
    }
    ;
    const job = await job_1.Job.findOne({ authorId: recruiter._id, _id: jobId });
    if (!job) {
        const error = new Error('Không tìm thấy job');
        error.statusCode = 409;
        error.result = null;
        throw error;
    }
    await job_1.Job.findByIdAndDelete(jobId);
};
exports.deleteJob = deleteJob;
const getAllEvents = async (recruiterId, query, page, limit) => {
    const recruiter = await user_1.User.findById(recruiterId).populate('roleId');
    if (!recruiter) {
        const error = new Error('Không tìm thấy user');
        error.statusCode = 409;
        error.result = null;
        throw error;
    }
    ;
    if (recruiter.get('roleId.roleName') !== 'RECRUITER') {
        const error = new Error('UnAuthorized');
        error.statusCode = 401;
        error.result = {
            content: []
        };
        throw error;
    }
    ;
    const eventLenght = await event_1.Event.find(query).countDocuments();
    if (eventLenght === 0) {
        const error = new Error('Không tìm thấy event');
        error.statusCode = 200;
        error.success = true;
        error.result = {
            content: []
        };
        throw error;
    }
    ;
    const events = await event_1.Event.find(query).populate('authorId')
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
    const listEvents = events.map(e => {
        const { _id, authorId, ...rest } = e;
        delete rest._doc._id;
        delete rest._doc.authorId;
        return {
            eventId: _id.toString(),
            author: authorId.fullName,
            ...rest._doc
        };
    });
    return { listEvents, eventLenght };
};
exports.getAllEvents = getAllEvents;
const getSingleEvent = async (recruiterId, eventId) => {
    const recruiter = await user_1.User.findById(recruiterId).populate('roleId');
    if (!recruiter) {
        const error = new Error('Không tìm thấy user');
        error.statusCode = 409;
        error.result = null;
        throw error;
    }
    ;
    if (recruiter.get('roleId.roleName') !== 'RECRUITER') {
        const error = new Error('UnAuthorized');
        error.statusCode = 401;
        error.result = null;
        throw error;
    }
    ;
    const event = await event_1.Event.findById(eventId).populate('authorId');
    if (!event) {
        const error = new Error('Không tìm thấy event');
        error.statusCode = 400;
        error.result = null;
        throw error;
    }
    const { _id, authorId, ...rest } = event;
    delete rest._doc._id;
    delete rest._doc.authorId;
    const returnEvent = {
        eventId: _id.toString(),
        author: authorId.fullName,
        ...rest._doc,
    };
    return returnEvent;
};
exports.getSingleEvent = getSingleEvent;
const createEvent = async (recruiterId, image, title, name, description, time, location, deadline, startAt) => {
    const recruiter = await user_1.User.findById(recruiterId).populate('roleId');
    if (!recruiter) {
        const error = new Error('Không tìm thấy user');
        error.statusCode = 409;
        error.result = null;
        throw error;
    }
    ;
    if (recruiter.get('roleId.roleName') !== 'RECRUITER') {
        const error = new Error('UnAuthorized');
        error.statusCode = 401;
        error.result = null;
        throw error;
    }
    ;
    const isExist = await event_1.Event.findOne({ name: name });
    if (isExist) {
        const error = new Error('Tên event này đã được tạo vui lòng chọn tên khác.');
        error.statusCode = 409;
        error.result = null;
        throw error;
    }
    const result = await cloudinary_1.v2.uploader.upload(image.tempFilePath);
    if (!result) {
        const error = new Error('Upload thất bại');
        throw error;
    }
    ;
    const publicId = result.public_id;
    const imageUrl = cloudinary_1.v2.url(publicId);
    const event = new event_1.Event({
        authorId: recruiter._id,
        title: title,
        name: name,
        description: description,
        time: time,
        image: {
            publicId: publicId,
            url: imageUrl
        },
        isActive: true,
        location: location,
        deadline: deadline,
        startAt: startAt
    });
    await event.save();
};
exports.createEvent = createEvent;
const updateEvent = async (recruiterId, eventId, image, title, name, description, time, location, deadline, startAt) => {
    const recruiter = await user_1.User.findById(recruiterId).populate('roleId');
    if (!recruiter) {
        const error = new Error('Không tìm thấy user');
        error.statusCode = 409;
        error.result = null;
        throw error;
    }
    ;
    if (recruiter.get('roleId.roleName') !== 'RECRUITER') {
        const error = new Error('UnAuthorized');
        error.statusCode = 401;
        error.result = null;
        throw error;
    }
    ;
    const event = await event_1.Event.findById(eventId);
    if (!event) {
        const error = new Error('event không tồn tại');
        error.statusCode = 409;
        error.result = null;
        throw error;
    }
    if (image) {
        if (image.mimetype !== 'image/jpg' && image.mimetype !== 'image/png' && image.mimetype !== 'image/jpeg') {
            const error = new Error('File ảnh chỉ được phép là jpg,png,jpeg');
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        ;
        const result = await cloudinary_1.v2.uploader.upload(image.tempFilePath);
        if (!result) {
            const error = new Error('Upload thất bại');
            throw error;
        }
        ;
        const publicId = result.public_id;
        const imageUrl = cloudinary_1.v2.url(publicId);
        const deleteEventImage = event.image?.publicId;
        if (deleteEventImage) {
            await cloudinary_1.v2.uploader.destroy(deleteEventImage);
        }
        event.image = {
            publicId: publicId,
            url: imageUrl
        };
    }
    event.title = title;
    event.name = name;
    event.description = description;
    event.time = time;
    event.location = location;
    event.deadline = deadline;
    event.startAt = startAt;
    await event.save();
};
exports.updateEvent = updateEvent;
const deleteEvent = async (recruiterId, eventId) => {
    const recruiter = await user_1.User.findById(recruiterId).populate('roleId');
    if (!recruiter) {
        const error = new Error('Không tìm thấy user');
        error.statusCode = 409;
        error.result = null;
        throw error;
    }
    ;
    if (recruiter.get('roleId.roleName') !== 'RECRUITER') {
        const error = new Error('UnAuthorized');
        error.statusCode = 401;
        error.result = null;
        throw error;
    }
    ;
    const event = await event_1.Event.findById(eventId);
    if (!event) {
        const error = new Error('event không tồn tại');
        error.statusCode = 409;
        error.result = null;
        throw error;
    }
    const deleteEventImage = event.image?.publicId;
    if (deleteEventImage) {
        await cloudinary_1.v2.uploader.destroy(deleteEventImage);
    }
    await event_1.Event.findByIdAndDelete(eventId);
};
exports.deleteEvent = deleteEvent;
const getAllInterviewers = async (recruiterId, name, skill, page, limit) => {
    const recruiter = await user_1.User.findById(recruiterId).populate('roleId');
    if (!recruiter) {
        const error = new Error('Không tìm thấy user');
        error.statusCode = 409;
        error.result = null;
        throw error;
    }
    ;
    if (recruiter.get('roleId.roleName') !== 'RECRUITER') {
        const error = new Error('UnAuthorized');
        error.statusCode = 401;
        error.result = {
            content: []
        };
        throw error;
    }
    ;
    const roleInterviewerId = await role_1.Role.findOne({ roleName: "INTERVIEWER" });
    const query = {
        roleId: roleInterviewerId?._id.toString()
    };
    if (name) {
        query['fullName'] = new RegExp(name, 'i');
    }
    ;
    if (skill) {
        const skillId = await skill_1.Skill.findOne({ name: skill });
        query['skills.skillId'] = skillId;
    }
    const interviewerLength = await user_1.User.find(query).countDocuments();
    const interviewerList = await user_1.User.find(query).populate('roleId skills.skillId')
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
    const mappedInterviewers = interviewerList.map(interviewer => {
        let listSkill = [];
        for (let i = 0; i < interviewer.skills.length; i++) {
            listSkill.push({ label: interviewer.skills[i].skillId.name, value: i });
        }
        return {
            interviewerId: interviewer._id.toString(),
            avatar: interviewer.avatar?.url,
            fullName: interviewer.fullName,
            about: interviewer.about,
            email: interviewer.email,
            dateOfBirth: interviewer.dateOfBirth,
            address: interviewer.address,
            phone: interviewer.phone,
            skills: listSkill
        };
    });
    return { mappedInterviewers, interviewerLength };
};
exports.getAllInterviewers = getAllInterviewers;
const getSingleInterviewer = async (recruiterId, interviewerId) => {
    const recruiter = await user_1.User.findById(recruiterId).populate('roleId');
    if (!recruiter) {
        const error = new Error('Không tìm thấy user');
        error.statusCode = 409;
        error.result = null;
        throw error;
    }
    ;
    if (recruiter.get('roleId.roleName') !== 'RECRUITER') {
        const error = new Error('UnAuthorized');
        error.statusCode = 401;
        error.result = null;
        throw error;
    }
    ;
    const interviewer = await user_1.User.findById(interviewerId).populate('roleId skills.skillId');
    if (!interviewer) {
        const error = new Error('Interviewer không tồn tại');
        error.statusCode = 409;
        error.result = null;
        throw error;
    }
    const educationList = await education_1.Education.find({ candidateId: interviewer._id.toString() });
    const returnEducationList = educationList.map(e => {
        return {
            school: e.school,
            major: e.major,
            graduatedYead: e.graduatedYear
        };
    });
    const experienceList = await experience_1.Experience.find({ candidateId: interviewer._id.toString() });
    const returnExperienceList = experienceList.map(e => {
        return {
            companyName: e.companyName,
            position: e.position,
            dateFrom: e.dateFrom,
            dateTo: e.dateTo
        };
    });
    const certificateList = await certificate_1.Certificate.find({ candidateId: interviewer._id.toString() });
    const returnCertificateList = certificateList.map(c => {
        return {
            name: c.name,
            receivedDate: c.receivedDate,
            url: c.url
        };
    });
    const projectList = await project_1.Project.find({ candidateId: interviewer._id.toString() });
    const returnProjectList = projectList.map(p => {
        return {
            name: p.name,
            description: p.description,
            url: p.url
        };
    });
    let listSkill = [];
    for (let i = 0; i < interviewer.skills.length; i++) {
        listSkill.push({ label: interviewer.skills[i].skillId.name, value: i });
    }
    const returnInterviewer = {
        fullName: interviewer.fullName,
        avatar: interviewer.avatar?.url,
        about: interviewer.about,
        email: interviewer.email,
        dateOfBirth: interviewer.dateOfBirth,
        address: interviewer.address,
        phone: interviewer.phone,
        skills: listSkill,
        information: {
            education: returnEducationList,
            experience: returnExperienceList,
            certificate: returnCertificateList,
            project: returnProjectList,
            skills: listSkill
        }
    };
    return returnInterviewer;
};
exports.getSingleInterviewer = getSingleInterviewer;
const getAllApplicants = async (recruiterId, name, skill, page, limit) => {
    const recruiter = await user_1.User.findById(recruiterId).populate('roleId');
    if (!recruiter) {
        const error = new Error('Không tìm thấy user');
        error.statusCode = 409;
        error.result = null;
        throw error;
    }
    ;
    if (recruiter.get('roleId.roleName') !== 'RECRUITER') {
        const error = new Error('UnAuthorized');
        error.statusCode = 401;
        error.result = null;
        throw error;
    }
    ;
    const listApplicants = await jobApply_1.JobApply.aggregate([
        {
            $lookup: {
                from: 'jobs',
                localField: 'jobAppliedId',
                foreignField: '_id',
                as: 'jobs'
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'candidateId',
                foreignField: '_id',
                as: 'applicants'
            }
        },
        {
            $lookup: {
                from: 'skills',
                localField: 'applicants.skills.skillId',
                foreignField: '_id',
                as: 'skills'
            }
        },
        {
            $match: {
                "jobs.authorId": new mongoose_1.default.Types.ObjectId(recruiter._id.toString()),
                "applicants.fullName": name ? new RegExp(name, 'i') : { $exists: true },
                "skills.name": skill ? skill : { $exists: true },
            }
        }
    ]).sort({ updatedAt: -1 });
    const mappedApplicants = listApplicants.map(applicant => {
        let listSkill = [];
        for (let i = 0; i < applicant.skills.length; i++) {
            listSkill.push({ label: applicant.skills[i].name, value: i });
        }
        return {
            candidateId: applicant.candidateId._id.toString(),
            blackList: applicant.applicants[0].blackList,
            avatar: applicant.applicants[0].avatar ? applicant.applicants[0].avatar.url : null,
            candidateFullName: applicant.applicants[0].fullName,
            candidateEmail: applicant.applicants[0].email,
            about: applicant.applicants[0].about,
            dateOfBirth: applicant.applicants[0].dateOfBirth,
            address: applicant.applicants[0].address,
            phone: applicant.applicants[0].phone,
            skills: listSkill
        };
    });
    const getHash = (obj) => JSON.stringify(obj);
    const returnApplicants = Array.from(new Set(mappedApplicants.map(getHash))).map((hash) => JSON.parse(hash));
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const applicantLength = returnApplicants.length;
    const applicantList = returnApplicants.slice(startIndex, endIndex);
    return { applicantList, applicantLength };
};
exports.getAllApplicants = getAllApplicants;
const getSingleApplicant = async (recruiterId, applicantId) => {
    const recruiter = await user_1.User.findById(recruiterId).populate('roleId');
    if (!recruiter) {
        const error = new Error('Không tìm thấy user');
        error.statusCode = 409;
        error.result = null;
        throw error;
    }
    ;
    if (recruiter.get('roleId.roleName') !== 'RECRUITER') {
        const error = new Error('UnAuthorized');
        error.statusCode = 401;
        error.result = null;
        throw error;
    }
    ;
    const applicant = await user_1.User.findById(applicantId).populate('roleId skills.skillId');
    if (!applicant) {
        const error = new Error('Ứng viên không tồn tại');
        error.statusCode = 409;
        error.result = null;
        throw error;
    }
    const educationList = await education_1.Education.find({ candidateId: applicant._id.toString() });
    const returnEducationList = educationList.map(e => {
        return {
            school: e.school,
            major: e.major,
            graduatedYead: e.graduatedYear
        };
    });
    const experienceList = await experience_1.Experience.find({ candidateId: applicant._id.toString() });
    const returnExperienceList = experienceList.map(e => {
        return {
            companyName: e.companyName,
            position: e.position,
            dateFrom: e.dateFrom,
            dateTo: e.dateTo
        };
    });
    const certificateList = await certificate_1.Certificate.find({ candidateId: applicant._id.toString() });
    const returnCertificateList = certificateList.map(c => {
        return {
            name: c.name,
            receivedDate: c.receivedDate,
            url: c.url
        };
    });
    const projectList = await project_1.Project.find({ candidateId: applicant._id.toString() });
    const returnProjectList = projectList.map(p => {
        return {
            name: p.name,
            description: p.description,
            url: p.url
        };
    });
    let listSkill = [];
    for (let i = 0; i < applicant.skills.length; i++) {
        listSkill.push({ label: applicant.skills[i].skillId.name, value: i });
    }
    const returnApplicant = {
        candidateId: applicant._id.toString(),
        blackList: applicant.blackList,
        avatar: applicant.get('avatar.url'),
        candidateFullName: applicant.fullName,
        candidateEmail: applicant.email,
        about: applicant.about,
        dateOfBirth: applicant.dateOfBirth,
        address: applicant.address,
        phone: applicant.phone,
        information: {
            education: returnEducationList,
            experience: returnExperienceList,
            certificate: returnCertificateList,
            project: returnProjectList,
            skills: listSkill
        }
    };
    return returnApplicant;
};
exports.getSingleApplicant = getSingleApplicant;
const getApplicantsJob = async (recruiterId, jobId, page, limit) => {
    const recruiter = await user_1.User.findById(recruiterId).populate('roleId');
    if (!recruiter) {
        const error = new Error('Không tìm thấy user');
        error.statusCode = 409;
        error.result = null;
        throw error;
    }
    ;
    if (recruiter.get('roleId.roleName') !== 'RECRUITER') {
        const error = new Error('UnAuthorized');
        error.statusCode = 401;
        error.result = null;
        throw error;
    }
    ;
    const applicantsJobLength = await jobApply_1.JobApply.find({ jobAppliedId: jobId }).countDocuments();
    if (applicantsJobLength === 0) {
        const error = new Error('Chưa có ứng viên nào apply vào công việc này');
        error.statusCode = 200;
        error.result = {
            content: []
        };
        throw error;
    }
    const ListApplicantsJob = await jobApply_1.JobApply.find({ jobAppliedId: jobId })
        .populate({
        path: 'candidateId',
        model: user_1.User,
        populate: {
            path: 'skills.skillId',
            model: skill_1.Skill
        }
    })
        .populate('resumeId')
        .skip((page - 1) * limit)
        .limit(limit);
    const returnListApplicants = async () => {
        const mappedApplicants = await Promise.all(ListApplicantsJob.map(async (applicant) => {
            try {
                const educationList = await education_1.Education.find({ candidateId: applicant.candidateId._id.toString() });
                const returnEducationList = educationList.map(e => {
                    return {
                        school: e.school,
                        major: e.major,
                        graduatedYead: e.graduatedYear
                    };
                });
                const experienceList = await experience_1.Experience.find({ candidateId: applicant.candidateId._id.toString() });
                const returnExperienceList = experienceList.map(e => {
                    return {
                        companyName: e.companyName,
                        position: e.position,
                        dateFrom: e.dateFrom,
                        dateTo: e.dateTo
                    };
                });
                const certificateList = await certificate_1.Certificate.find({ candidateId: applicant.candidateId._id.toString() });
                const returnCertificateList = certificateList.map(c => {
                    return {
                        name: c.name,
                        receivedDate: c.receivedDate,
                        url: c.url
                    };
                });
                const projectList = await project_1.Project.find({ candidateId: applicant.candidateId._id.toString() });
                const returnProjectList = projectList.map(p => {
                    return {
                        name: p.name,
                        description: p.description,
                        url: p.url
                    };
                });
                let listSkill = [];
                for (let i = 0; i < applicant.get('candidateId.skills').length; i++) {
                    listSkill.push({ label: applicant.get('candidateId.skills')[i].skillId.name, value: i });
                }
                const interview = await interview_1.Interview.findOne({ jobApplyId: applicant.jobAppliedId._id.toString(), candidateId: applicant.candidateId._id.toString() });
                const interviewers = await interviewerInterview_1.InterviewerInterview.findOne({ interviewId: interview?._id.toString() }).populate('interviewersId');
                const interviewerFullNames = interviewers?.interviewersId.map(interviewer => {
                    return interviewer.fullName;
                });
                const scoreInterviewer = await questionCandidate_1.QuestionCandidate.find({ interviewId: interview?._id.toString() });
                let totalScore;
                if (scoreInterviewer) {
                    totalScore = "0/0";
                    for (let i = 0; i < scoreInterviewer.length; i++) {
                        if (!scoreInterviewer[i].totalScore) {
                            totalScore = null;
                            break;
                        }
                        totalScore = (0, utils_1.addFractionStrings)(totalScore, scoreInterviewer[i].totalScore);
                    }
                    if (totalScore) {
                        const [numerator, denominator] = totalScore.split('/').map(Number);
                        if (denominator === 0) {
                            totalScore = null;
                        }
                        else {
                            totalScore = `${(numerator * 100 / denominator).toFixed(0)}/100`;
                        }
                    }
                }
                else {
                    totalScore = null;
                }
                return {
                    candidateId: applicant.candidateId._id.toString(),
                    blackList: applicant.get('candidateId.blackList'),
                    avatar: applicant.get('candidateId.avatar.url'),
                    candidateFullName: applicant.get('candidateId.fullName'),
                    candidateEmail: applicant.get('candidateId.email'),
                    interviewerFullNames: interviewerFullNames ? interviewerFullNames : [],
                    score: totalScore,
                    state: applicant.status,
                    dateOfBirth: applicant.get('candidateId.dateOfBirth'),
                    address: applicant.get('candidateId.address'),
                    phone: applicant.get('candidateId.phone'),
                    cv: applicant.get('resumeId.resumeUpload'),
                    information: {
                        education: returnEducationList,
                        experience: returnExperienceList,
                        certificate: returnCertificateList,
                        project: returnProjectList,
                        skills: listSkill
                    }
                };
            }
            catch (error) {
                console.error(error);
                return null;
            }
        }));
        return mappedApplicants.filter(applicant => applicant !== null);
    };
    const applicantList = await returnListApplicants().then(mappedApplicants => {
        return mappedApplicants;
    });
    return { applicantList, applicantsJobLength };
};
exports.getApplicantsJob = getApplicantsJob;
const getSingleApplicantJob = async (recruiterId, jobId, candidateId) => {
    const recruiter = await user_1.User.findById(recruiterId).populate('roleId');
    if (!recruiter) {
        const error = new Error('Không tìm thấy user');
        error.statusCode = 409;
        error.result = null;
        throw error;
    }
    ;
    if (recruiter.get('roleId.roleName') !== 'RECRUITER') {
        const error = new Error('UnAuthorized');
        error.statusCode = 401;
        error.result = null;
        throw error;
    }
    ;
    const applicant = await jobApply_1.JobApply.findOne({ jobAppliedId: jobId, candidateId: candidateId })
        .populate({
        path: 'candidateId',
        model: user_1.User,
        populate: {
            path: 'skills.skillId',
            model: skill_1.Skill
        }
    })
        .populate('resumeId');
    if (!applicant) {
        const error = new Error('Không thể tìm thấy ứng viên');
        error.statusCode = 409;
        error.result = null;
        throw error;
    }
    const educationList = await education_1.Education.find({ candidateId: applicant.candidateId._id.toString() });
    const returnEducationList = educationList.map(e => {
        return {
            school: e.school,
            major: e.major,
            graduatedYead: e.graduatedYear
        };
    });
    const experienceList = await experience_1.Experience.find({ candidateId: applicant.candidateId._id.toString() });
    const returnExperienceList = experienceList.map(e => {
        return {
            companyName: e.companyName,
            position: e.position,
            dateFrom: e.dateFrom,
            dateTo: e.dateTo
        };
    });
    const certificateList = await certificate_1.Certificate.find({ candidateId: applicant.candidateId._id.toString() });
    const returnCertificateList = certificateList.map(c => {
        return {
            name: c.name,
            receivedDate: c.receivedDate,
            url: c.url
        };
    });
    const projectList = await project_1.Project.find({ candidateId: applicant.candidateId._id.toString() });
    const returnProjectList = projectList.map(p => {
        return {
            name: p.name,
            description: p.description,
            url: p.url
        };
    });
    let listSkill = [];
    for (let i = 0; i < applicant.get('candidateId.skills').length; i++) {
        listSkill.push({ label: applicant.get('candidateId.skills')[i].skillId.name, value: i });
    }
    const interview = await interview_1.Interview.findOne({ jobApplyId: jobId, candidateId: candidateId });
    const interviewers = await interviewerInterview_1.InterviewerInterview.findOne({ interviewId: interview?._id.toString() }).populate('interviewersId');
    const interviewerFullNames = interviewers?.interviewersId.map(interviewer => {
        return interviewer.fullName;
    });
    const scoreInterviewer = await questionCandidate_1.QuestionCandidate.find({ interviewId: interview?._id.toString() });
    let totalScore;
    if (scoreInterviewer) {
        totalScore = "0/0";
        for (let i = 0; i < scoreInterviewer.length; i++) {
            if (!scoreInterviewer[i].totalScore) {
                totalScore = null;
                break;
            }
            totalScore = (0, utils_1.addFractionStrings)(totalScore, scoreInterviewer[i].totalScore);
        }
        if (totalScore) {
            const [numerator, denominator] = totalScore.split('/').map(Number);
            if (denominator === 0) {
                totalScore = null;
            }
            else {
                totalScore = `${(numerator * 100 / denominator).toFixed(0)}/100`;
            }
        }
    }
    else {
        totalScore = null;
    }
    const returnApplicant = {
        candidateId: applicant.candidateId._id.toString(),
        blackList: applicant.get('candidateId.blackList'),
        avatar: applicant.get('candidateId.avatar.url'),
        candidateFullName: applicant.get('candidateId.fullName'),
        candidateEmail: applicant.get('candidateId.email'),
        interviewerFullNames: interviewerFullNames,
        score: totalScore,
        state: applicant.status,
        dateOfBirth: applicant.get('candidateId.dateOfBirth'),
        address: applicant.get('candidateId.address'),
        phone: applicant.get('candidateId.phone'),
        cv: applicant.get('resumeId.resumeUpload'),
        information: {
            education: returnEducationList,
            experience: returnExperienceList,
            certificate: returnCertificateList,
            project: returnProjectList,
            skills: listSkill
        }
    };
    return returnApplicant;
};
exports.getSingleApplicantJob = getSingleApplicantJob;
const createMeeting = async (recruiterId, candidateId, interviewersId, time, jobApplyId) => {
    const recruiter = await user_1.User.findById(recruiterId).populate('roleId');
    if (!recruiter) {
        const error = new Error('Không tìm thấy user');
        error.statusCode = 409;
        error.result = null;
        throw error;
    }
    ;
    if (recruiter.get('roleId.roleName') !== 'RECRUITER') {
        const error = new Error('UnAuthorized');
        error.statusCode = 401;
        error.result = null;
        throw error;
    }
    ;
    const candidate = await user_1.User.findById(candidateId);
    if (!candidate) {
        const error = new Error('Không tìm thấy candidate');
        error.statusCode = 409;
        error.result = null;
        throw error;
    }
    const jobId = await job_1.Job.findById(jobApplyId);
    if (!jobId) {
        const error = new Error('Không tìm thấy Job');
        error.statusCode = 409;
        error.result = null;
        throw error;
    }
    const jobApply = await jobApply_1.JobApply.findOne({ candidateId: candidateId, jobAppliedId: jobApplyId }).populate('resumeId');
    if (!jobApply) {
        const error = new Error('Không tìm thấy Job Apply');
        error.statusCode = 409;
        error.result = null;
        throw error;
    }
    const clientId = 'ef86ecc5-3294-4b4d-986e-d0377dc29b20';
    const tenantId = '1f74f109-07f6-4291-81bc-64bc4acbd48a';
    const clientSecret = `${process.env.CLIENT_SECRET}`;
    const scopes = ["https://graph.microsoft.com/.default"];
    const credentialOptions = {
        authorityHost: "https://login.microsoftonline.com",
    };
    const credential = new identity_1.ClientSecretCredential(tenantId, clientId, clientSecret, credentialOptions);
    const graphClient = GraphClient.Client.init({
        authProvider: (done) => {
            credential
                .getToken(scopes)
                .then((tokenResponse) => {
                const token = tokenResponse?.token;
                if (token) {
                    done(null, token);
                }
                else {
                    done(new Error("Failed to retrieve access token"), null);
                }
            })
                .catch((error) => done(error, null));
        },
    });
    const startDateTime = new Date(time);
    const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);
    const onlineMeeting = {
        startDateTime: startDateTime.toISOString(),
        endDateTime: endDateTime.toISOString(),
        subject: 'Interview',
        lobbyBypassSettings: {
            scope: 'everyone',
            isDialInBypassEnabled: true,
        },
    };
    const result = await graphClient
        .api(`/users/021e095b-02f2-4e67-9ea8-a1fbe63d77ae/onlineMeetings`)
        .post(onlineMeeting);
    console.log(result);
    const meetingUrl = result.joinWebUrl;
    const interview = new interview_1.Interview({
        candidateId: candidateId,
        jobApplyId: jobApplyId,
        time: startDateTime.toISOString(),
        interviewLink: meetingUrl,
        state: 'PENDING',
        authorId: recruiter._id.toString()
    });
    await interview.save();
    const interviewerInterview = new interviewerInterview_1.InterviewerInterview({
        interviewersId: interviewersId,
        interviewId: interview._id.toString()
    });
    await interviewerInterview.save();
    jobApply.status = "REVIEWING";
    await jobApply.save();
    let interviewersMail = [];
    let interviewersName = [];
    for (let i = 0; i < interviewersId.length; i++) {
        const interviewer = await user_1.User.findById(interviewersId[i].toString());
        if (!interviewer) {
            const error = new Error('Không tìm thấy interviewer');
            error.statusCode = 409;
            error.result = null;
            throw error;
        }
        interviewersMail.push(interviewer.email);
        interviewersName.push(interviewer.fullName);
    }
    let attendees = interviewersMail.concat(candidate.email);
    let mailDetails = {
        from: 'nguyennghia193913@gmail.com',
        cc: attendees.join(','),
        subject: 'Interview Information',
        html: ` 
            <div style="display: flex; justify-content: space-around">
                <div>
                    <div style="display: flex; justify-content: center">
                        <h2 style="color:blue; text-align: center;">Interview Information</h2>
                    </div>
                    <p>Dear ${candidate.fullName}</p>
                    <p>Thank you for applying to Job Port.</p>
                    <p>We've reviewed your application materials and we're excited to invite you to interview for the role.</p>
                    <p>Your interview will be conducted via online meeting with ${recruiter.fullName} (Recruiter).</p>
                    <p>The interview time is on ${(0, utils_1.formatDateToJSDateObject)(startDateTime)}.</p>
                    <p>If you have any questions, please don't hesitate to contact us.</p>
                    <p>Regard, ${recruiter.fullName}.</p>
                    <p><b>Start Date:</b> ${(0, utils_1.formatDateToJSDateObject)(startDateTime)}</p>
                    <p><b>Candidate:</b> ${candidate.fullName} (${candidate.email})</p>
                    <p><b>Recruiter:</b> ${recruiter.fullName} (${recruiter.email})</p>
                    <b>Interviewer:</b>
                    ${interviewersMail.map((email, index) => `
                        <p>${interviewersName[index]} (${email})</p>
                    `).join('')}
                </div>
                
                <div>
                    <h2 style="color:blue; text-align: center;">Join the Meeting</h2>
                    <div style="text-align: center">
                        <button style="background-color: #008000; padding: 10px 50px; border-radius: 5px; border-style: none;"><a href="${meetingUrl}" style="font-size: 15px;color: white; text-decoration: none">Join Now</a></button>
                    </div>
                    <p><b>Description:</b> Job: N&T</p>
                    <p><b>Link applicant CV:</b> <a href="${jobApply.get('resumeId.resumeUpload')}">Download CV</a></p>
                </div>
            </div>
            `,
        attachments: [
            {
                filename: 'invitation.ics',
                content: (0, utils_1.createICalEvent)(startDateTime, endDateTime, attendees),
                encoding: 'base64'
            }
        ]
    };
    utils_1.transporter.sendMail(mailDetails, err => {
        const error = new Error('Gửi mail thất bại');
        throw error;
    });
};
exports.createMeeting = createMeeting;
const updateCandidateState = async (recruiterId, candidateId, jobId, state) => {
    const recruiter = await user_1.User.findById(recruiterId).populate('roleId');
    if (!recruiter) {
        const error = new Error('Không tìm thấy user');
        error.statusCode = 409;
        error.result = null;
        throw error;
    }
    ;
    if (recruiter.get('roleId.roleName') !== 'RECRUITER') {
        const error = new Error('UnAuthorized');
        error.statusCode = 401;
        error.result = null;
        throw error;
    }
    ;
    const jobApply = await jobApply_1.JobApply.findOne({ candidateId: candidateId, jobAppliedId: jobId });
    if (!jobApply) {
        const error = new Error('Không tìm thấy job apply');
        error.statusCode = 409;
        error.result = null;
        throw error;
    }
    jobApply.status = state;
    jobApply.authorId = recruiter._id;
    await jobApply.save();
};
exports.updateCandidateState = updateCandidateState;
const getJobSuggestedCandidates = async (recruiterId, jobId, page, limit) => {
    const recruiter = await user_1.User.findById(recruiterId).populate('roleId');
    if (!recruiter) {
        const error = new Error('Không tìm thấy user');
        error.statusCode = 409;
        error.result = null;
        throw error;
    }
    ;
    if (recruiter.get('roleId.roleName') !== 'RECRUITER') {
        const error = new Error('UnAuthorized');
        error.statusCode = 401;
        error.result = null;
        throw error;
    }
    ;
    const suggestedCandidateLength = await jobApply_1.JobApply.find({ jobAppliedId: jobId, status: "PASS" }).countDocuments();
    if (suggestedCandidateLength === 0) {
        const error = new Error('Chưa có ứng viên nào PASS công việc này');
        error.statusCode = 200;
        error.result = {
            content: []
        };
        throw error;
    }
    const suggestedCandidates = await jobApply_1.JobApply.find({ jobAppliedId: jobId, status: "PASS" })
        .populate({
        path: 'candidateId',
        model: user_1.User,
        populate: {
            path: 'skills.skillId',
            model: skill_1.Skill
        }
    })
        .populate('resumeId')
        .skip((page - 1) * limit)
        .limit(limit);
    const returnListApplicants = async () => {
        const mappedApplicants = await Promise.all(suggestedCandidates.map(async (applicant) => {
            try {
                const educationList = await education_1.Education.find({ candidateId: applicant.candidateId._id.toString() });
                const returnEducationList = educationList.map(e => {
                    return {
                        school: e.school,
                        major: e.major,
                        graduatedYead: e.graduatedYear
                    };
                });
                const experienceList = await experience_1.Experience.find({ candidateId: applicant.candidateId._id.toString() });
                const returnExperienceList = experienceList.map(e => {
                    return {
                        companyName: e.companyName,
                        position: e.position,
                        dateFrom: e.dateFrom,
                        dateTo: e.dateTo
                    };
                });
                const certificateList = await certificate_1.Certificate.find({ candidateId: applicant.candidateId._id.toString() });
                const returnCertificateList = certificateList.map(c => {
                    return {
                        name: c.name,
                        receivedDate: c.receivedDate,
                        url: c.url
                    };
                });
                const projectList = await project_1.Project.find({ candidateId: applicant.candidateId._id.toString() });
                const returnProjectList = projectList.map(p => {
                    return {
                        name: p.name,
                        description: p.description,
                        url: p.url
                    };
                });
                let listSkill = [];
                for (let i = 0; i < applicant.get('candidateId.skills').length; i++) {
                    listSkill.push({ label: applicant.get('candidateId.skills')[i].skillId.name, value: i });
                }
                const interview = await interview_1.Interview.findOne({ jobApplyId: applicant.jobAppliedId._id.toString(), candidateId: applicant.candidateId._id.toString() });
                const interviewers = await interviewerInterview_1.InterviewerInterview.findOne({ interviewId: interview?._id.toString() }).populate('interviewersId');
                const interviewerFullNames = interviewers?.interviewersId.map(interviewer => {
                    return interviewer.fullName;
                });
                const scoreInterviewer = await questionCandidate_1.QuestionCandidate.find({ interviewId: interview?._id.toString() });
                const score = scoreInterviewer.reduce((totalScore, scoreInterviewer) => {
                    return (0, utils_1.addFractionStrings)(totalScore, scoreInterviewer.totalScore);
                }, "0/0");
                const [numerator, denominator] = score.split('/').map(Number);
                let totalScore;
                if (denominator === 0) {
                    totalScore = null;
                }
                else {
                    totalScore = `${numerator * 100 / denominator}/100`;
                }
                return {
                    candidateId: applicant.candidateId._id.toString(),
                    blackList: applicant.get('candidateId.blackList'),
                    avatar: applicant.get('candidateId.avatar.url'),
                    candidateFullName: applicant.get('candidateId.fullName'),
                    candidateEmail: applicant.get('candidateId.email'),
                    interviewerFullNames: interviewerFullNames,
                    score: totalScore,
                    state: applicant.status,
                    dateOfBirth: applicant.get('candidateId.dateOfBirth'),
                    address: applicant.get('candidateId.address'),
                    phone: applicant.get('candidateId.phone'),
                    cv: applicant.get('resumeId.resumeUpload'),
                    information: {
                        education: returnEducationList,
                        experience: returnExperienceList,
                        certificate: returnCertificateList,
                        project: returnProjectList,
                        skills: listSkill
                    }
                };
            }
            catch (error) {
                console.error(error);
                return null;
            }
        }));
        return mappedApplicants.filter(applicant => applicant !== null);
    };
    const sugggestedCandidateList = await returnListApplicants().then(mappedApplicants => {
        return mappedApplicants;
    });
    return { sugggestedCandidateList, suggestedCandidateLength };
};
exports.getJobSuggestedCandidates = getJobSuggestedCandidates;
const getInterviewsOfCandidate = async (recruiterId, candidateId, page, limit) => {
    const recruiter = await user_1.User.findById(recruiterId).populate('roleId');
    if (!recruiter) {
        const error = new Error('Không tìm thấy user');
        error.statusCode = 409;
        error.result = null;
        throw error;
    }
    ;
    if (recruiter.get('roleId.roleName') !== 'RECRUITER') {
        const error = new Error('UnAuthorized');
        error.statusCode = 401;
        error.result = null;
        throw error;
    }
    ;
    const interviews = await interviewerInterview_1.InterviewerInterview.aggregate([
        {
            $lookup: {
                from: "interviews",
                localField: "interviewId",
                foreignField: "_id",
                as: "interviews"
            }
        },
        {
            $lookup: {
                from: "jobs",
                localField: "interviews.jobApplyId",
                foreignField: "_id",
                as: "jobs"
            }
        },
        {
            $lookup: {
                from: "jobpositions",
                localField: "jobs.positionId",
                foreignField: "_id",
                as: "jobpositions"
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "interviewersId",
                foreignField: "_id",
                as: "interviewers"
            }
        },
        {
            $match: {
                "interviews.candidateId": new mongoose_1.default.Types.ObjectId(candidateId),
                "jobs.authorId": new mongoose_1.default.Types.ObjectId(recruiter._id.toString())
            }
        },
    ]).sort({ updatedAt: -1 });
    if (interviews.length === 0) {
        const error = new Error('Bạn chưa có buổi phỏng vấn nào.');
        error.statusCode = 200;
        error.result = {
            content: []
        };
        throw error;
    }
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const returnInterviews = interviews.map(interview => {
        const interviewersFullName = interview.interviewers.map((interviewer) => {
            return interviewer.fullName;
        });
        return {
            interviewId: interview.interviews[0]._id.toString(),
            jobName: interview.jobs[0].name,
            interviewLink: interview.interviews[0].interviewLink,
            time: interview.interviews[0].time,
            position: interview.jobpositions[0].name,
            state: interview.interviews[0].state,
            interviewersFullName: interviewersFullName
        };
    });
    const interviewLength = interviews.length;
    const interviewList = returnInterviews.slice(startIndex, endIndex);
    return { interviewList, interviewLength };
};
exports.getInterviewsOfCandidate = getInterviewsOfCandidate;
const getInterviewsOfInterviewer = async (recruiterId, interviewerId, page, limit) => {
    const recruiter = await user_1.User.findById(recruiterId).populate('roleId');
    if (!recruiter) {
        const error = new Error('Không tìm thấy user');
        error.statusCode = 409;
        error.result = null;
        throw error;
    }
    ;
    if (recruiter.get('roleId.roleName') !== 'RECRUITER') {
        const error = new Error('UnAuthorized');
        error.statusCode = 401;
        error.result = null;
        throw error;
    }
    ;
    const listInterviews = await interviewerInterview_1.InterviewerInterview.aggregate([
        {
            $lookup: {
                from: 'users',
                localField: 'interviewersId',
                foreignField: '_id',
                as: 'interviewers'
            }
        },
        {
            $lookup: {
                from: 'interviews',
                localField: 'interviewId',
                foreignField: '_id',
                as: 'interviews'
            }
        },
        {
            $lookup: {
                from: 'jobs',
                localField: 'interviews.jobApplyId',
                foreignField: '_id',
                as: 'jobs'
            }
        },
        {
            $lookup: {
                from: "jobpositions",
                localField: "jobs.positionId",
                foreignField: "_id",
                as: "jobpositions"
            }
        },
        {
            $match: {
                "interviewers._id": new mongoose_1.default.Types.ObjectId(interviewerId),
                "jobs.authorId": new mongoose_1.default.Types.ObjectId(recruiter._id.toString()),
            }
        }
    ])
        .sort({ updatedAt: -1 });
    if (listInterviews.length === 0) {
        const error = new Error('Bạn chưa có buổi phỏng vấn nào.');
        error.statusCode = 200;
        error.result = {
            content: []
        };
        throw error;
    }
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const returnListInterviews = listInterviews.map(interview => {
        const listInterviewers = interview.interviewers.map((interviewer) => {
            return interviewer.fullName;
        });
        return {
            interviewId: interview.interviews[0]._id.toString(),
            jobName: interview.jobs[0].name,
            interviewLink: interview.interviews[0].interviewLink,
            time: interview.interviews[0].time,
            position: interview.jobpositions[0].name,
            state: interview.interviews[0].state,
            interviewersFullName: listInterviewers
        };
    });
    const interviewLength = listInterviews.length;
    const interviewList = returnListInterviews.slice(startIndex, endIndex);
    return { interviewList, interviewLength };
};
exports.getInterviewsOfInterviewer = getInterviewsOfInterviewer;
const recruiterStatistics = async (recruiterId) => {
    const recruiter = await user_1.User.findById(recruiterId).populate('roleId');
    if (!recruiter) {
        const error = new Error('Không tìm thấy user');
        error.statusCode = 409;
        error.result = null;
        throw error;
    }
    ;
    if (recruiter.get('roleId.roleName') !== 'RECRUITER') {
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
