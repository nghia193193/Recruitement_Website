"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllInterviews = exports.getInformation = exports.saveInformation = exports.GetInformation = exports.GetAppliedJobs = exports.ApplyJob = exports.CheckApply = exports.DeleteResume = exports.UploadResume = exports.GetResumes = void 0;
const express_validator_1 = require("express-validator");
const user_1 = require("../models/user");
const utils_1 = require("../utils");
const cloudinary_1 = require("cloudinary");
const resumeUpload_1 = require("../models/resumeUpload");
const jobApply_1 = require("../models/jobApply");
const job_1 = require("../models/job");
const education_1 = require("../models/education");
const experience_1 = require("../models/experience");
const certificate_1 = require("../models/certificate");
const project_1 = require("../models/project");
const skill_1 = require("../models/skill");
const interview_1 = require("../models/interview");
const interviewerInterview_1 = require("../models/interviewerInterview");
const mongoose_1 = __importDefault(require("mongoose"));
const GetResumes = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyToken)(accessToken);
        const candidate = await user_1.User.findById(decodedToken.userId).populate('roleId');
        if (candidate?.get('roleId.roleName') !== 'CANDIDATE') {
            const error = new Error('UnAuthorized');
            error.statusCode = 401;
            error.result = null;
            throw error;
        }
        ;
        const resumesLength = await resumeUpload_1.ResumeUpload.find({ candidateId: candidate._id }).countDocuments();
        const resumes = await resumeUpload_1.ResumeUpload.find({ candidateId: candidate.id }).sort({ updatedAt: -1 });
        const listResumes = resumes.map(resume => {
            return {
                resumeId: resume._id.toString(),
                name: resume.name,
                resumeUpload: resume.resumeUpload,
                createdDay: resume.createdAt
            };
        });
        res.status(200).json({ success: true, message: 'Lấy list resumes thành công', result: { content: listResumes, resumesLength: resumesLength }, statusCode: 200 });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        next(err);
    }
    ;
};
exports.GetResumes = GetResumes;
const UploadResume = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyToken)(accessToken);
        const candidate = await user_1.User.findById(decodedToken.userId).populate('roleId');
        if (candidate?.get('roleId.roleName') !== 'CANDIDATE') {
            const error = new Error('UnAuthorized');
            error.statusCode = 401;
            error.result = null;
            throw error;
        }
        ;
        if (!req.files || !req.files.resumeFile) {
            const error = new Error('Không có tệp nào được tải lên!');
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        ;
        const resume = req.files.resumeFile;
        if (!(0, utils_1.isPDF)(resume)) {
            const error = new Error('Resume chỉ cho phép file pdf');
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        ;
        const result = await cloudinary_1.v2.uploader.upload(resume.tempFilePath);
        if (!result) {
            const error = new Error('Upload thất bại');
            throw error;
        }
        ;
        const publicId = result.public_id;
        const resumeUrl = cloudinary_1.v2.url(publicId);
        const cv = new resumeUpload_1.ResumeUpload({
            candidateId: candidate._id,
            publicId: publicId,
            name: resume.name,
            resumeUpload: resumeUrl
        });
        await cv.save();
        const cvInfo = {
            resumeId: cv._id.toString(),
            name: resume.name,
            resumeUpload: resumeUrl,
            createDate: cv.createdAt
        };
        res.status(200).json({ success: true, message: 'Upload resume thành công', result: cvInfo, statusCode: 200 });
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
exports.UploadResume = UploadResume;
const DeleteResume = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyToken)(accessToken);
        const candidate = await user_1.User.findById(decodedToken.userId).populate('roleId');
        if (candidate?.get('roleId.roleName') !== 'CANDIDATE') {
            const error = new Error('UnAuthorized');
            error.statusCode = 401;
            error.result = null;
            throw error;
        }
        ;
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            const error = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        ;
        const resumeId = req.params.resumeId;
        const resume = await resumeUpload_1.ResumeUpload.findById(resumeId);
        if (!resume) {
            const error = new Error('Không tìm thấy resume');
            error.statusCode = 409;
            error.result = null;
            throw error;
        }
        ;
        const publicId = resume.publicId;
        const isDelete = await resumeUpload_1.ResumeUpload.findOneAndDelete({ _id: resumeId });
        if (!isDelete) {
            const error = new Error('Xóa resume thất bại');
            throw error;
        }
        ;
        await cloudinary_1.v2.uploader.destroy(publicId);
        res.status(200).json({ success: true, message: 'Xóa resume thành công', statusCode: 200 });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        next(err);
    }
    ;
};
exports.DeleteResume = DeleteResume;
const CheckApply = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyToken)(accessToken);
        const candidate = await user_1.User.findById(decodedToken.userId).populate('roleId');
        if (candidate?.get('roleId.roleName') !== 'CANDIDATE') {
            const error = new Error('UnAuthorized');
            error.statusCode = 401;
            error.result = null;
            throw error;
        }
        ;
        const jobId = req.params.jobId;
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            const error = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        ;
        const jobApply = await jobApply_1.JobApply.findOne({ jobAppliedId: jobId, candidateId: candidate._id.toString() });
        if (!jobApply) {
            res.status(200).json({ success: true, message: 'Bạn chưa apply vào công việc này', result: null });
        }
        res.status(200).json({ success: true, message: 'Bạn đã apply vào công việc này', result: {
                jobAppliedId: jobId,
                status: jobApply?.status
            } });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        next(err);
    }
};
exports.CheckApply = CheckApply;
const ApplyJob = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyToken)(accessToken);
        const candidate = await user_1.User.findById(decodedToken.userId).populate('roleId');
        if (candidate?.get('roleId.roleName') !== 'CANDIDATE') {
            const error = new Error('UnAuthorized');
            error.statusCode = 401;
            error.result = null;
            throw error;
        }
        ;
        const jobId = req.params.jobId;
        const resumeId = req.body.resumeId;
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            const error = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        ;
        const isExist = resumeUpload_1.ResumeUpload.findById(resumeId);
        if (!isExist) {
            const error = new Error('Resume không tồn tại');
            error.statusCode = 409;
            error.result = null;
            throw error;
        }
        const jobApplied = await jobApply_1.JobApply.findOne({ candidateId: candidate._id.toString(), jobAppliedId: jobId });
        if (jobApplied) {
            const error = new Error('Bạn đã apply vào job này');
            error.statusCode = 409;
            error.result = null;
            throw error;
        }
        const jobApply = new jobApply_1.JobApply({
            jobAppliedId: jobId.toString(),
            candidateId: candidate._id.toString(),
            resumeId: resumeId,
            status: utils_1.ApplyStatus[0]
        });
        await jobApply.save();
        const job = await job_1.Job.findById(jobId);
        res.status(200).json({ success: true, message: 'Apply thành công', result: {
                jobAppliedId: jobApply.jobAppliedId,
                status: jobApply.status,
                appliedDate: jobApply.createdAt,
                jobName: job?.name
            } });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        next(err);
    }
};
exports.ApplyJob = ApplyJob;
const GetAppliedJobs = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyToken)(accessToken);
        const candidate = await user_1.User.findById(decodedToken.userId).populate('roleId');
        if (candidate?.get('roleId.roleName') !== 'CANDIDATE') {
            const error = new Error('UnAuthorized');
            error.statusCode = 401;
            error.result = {
                content: []
            };
            throw error;
        }
        ;
        const page = req.query.page ? +req.query.page : 1;
        const limit = req.query.limit ? +req.query.limit : 10;
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            const error = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = {
                content: []
            };
            throw error;
        }
        const appliedJobsLength = await jobApply_1.JobApply.find({ candidateId: candidate._id.toString() }).countDocuments();
        if (appliedJobsLength === 0) {
            const error = new Error('Bạn chưa apply công việc nào');
            error.statusCode = 200;
            error.success = true;
            error.result = {
                content: []
            };
            throw error;
        }
        ;
        const appliedJobs = await jobApply_1.JobApply.find({ candidateId: candidate._id.toString() }).populate('jobAppliedId')
            .sort({ updatedAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);
        const retunAppliedJobs = appliedJobs.map(job => {
            return {
                jobAppliedId: job.jobAppliedId._id.toString(),
                status: job.status,
                AppliedDate: job.createdAt,
                jobName: job.get('jobAppliedId.name')
            };
        });
        res.status(200).json({ success: true, message: 'Lấy danh sách thành công', result: {
                pageNumber: page,
                totalPages: Math.ceil(appliedJobsLength / limit),
                limit: limit,
                totalElements: appliedJobsLength,
                content: retunAppliedJobs
            } });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        next(err);
    }
};
exports.GetAppliedJobs = GetAppliedJobs;
const GetInformation = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyToken)(accessToken);
        const candidate = await user_1.User.findById(decodedToken.userId).populate('roleId');
        if (candidate?.get('roleId.roleName') !== 'CANDIDATE') {
            const error = new Error('UnAuthorized');
            error.statusCode = 401;
            error.result = {
                content: []
            };
            throw error;
        }
        ;
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        next(err);
    }
};
exports.GetInformation = GetInformation;
const saveInformation = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyToken)(accessToken);
        const candidate = await user_1.User.findById(decodedToken.userId).populate('roleId');
        if (candidate?.get('roleId.roleName') !== 'CANDIDATE') {
            const error = new Error('UnAuthorized');
            error.statusCode = 401;
            error.result = {
                content: []
            };
            throw error;
        }
        ;
        const { education, experience, certificate, project, skills } = req.body;
        await education_1.Education.deleteMany({ candidateId: candidate._id.toString() });
        await experience_1.Experience.deleteMany({ candidateId: candidate._id.toString() });
        await certificate_1.Certificate.deleteMany({ candidateId: candidate._id.toString() });
        await project_1.Project.deleteMany({ candidateId: candidate._id.toString() });
        candidate.skills = [];
        await candidate.save();
        if (education.length !== 0) {
            for (let i = 0; i < education.length; i++) {
                let e = new education_1.Education({
                    candidateId: candidate._id.toString(),
                    school: education[i].school,
                    major: education[i].major,
                    graduatedYear: education[i].graduatedYear
                });
                await e.save();
            }
        }
        if (experience.length !== 0) {
            for (let i = 0; i < experience.length; i++) {
                let e = new experience_1.Experience({
                    candidateId: candidate._id.toString(),
                    companyName: experience[i].companyName,
                    position: experience[i].position,
                    dateFrom: experience[i].dateFrom,
                    dateTo: experience[i].dateTo
                });
                await e.save();
            }
        }
        if (certificate.length !== 0) {
            for (let i = 0; i < certificate.length; i++) {
                let c = new certificate_1.Certificate({
                    candidateId: candidate._id.toString(),
                    name: certificate[i].name,
                    receivedDate: certificate[i].receivedDate,
                    url: certificate[i].url,
                });
                await c.save();
            }
        }
        if (project.length !== 0) {
            for (let i = 0; i < project.length; i++) {
                let p = new project_1.Project({
                    candidateId: candidate._id.toString(),
                    name: project[i].name,
                    description: project[i].description,
                    url: project[i].url,
                });
                await p.save();
            }
        }
        if (skills.length !== 0) {
            for (let i = 0; i < skills.length; i++) {
                let skill = await skill_1.Skill.findOne({ name: skills[i].label });
                candidate.skills.push({ skillId: skill._id });
            }
            await candidate.save();
        }
        res.status(200).json({ success: true, message: "Successfully!", result: null });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        next(err);
    }
};
exports.saveInformation = saveInformation;
const getInformation = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyToken)(accessToken);
        const candidate = await user_1.User.findById(decodedToken.userId).populate('roleId');
        if (candidate?.get('roleId.roleName') !== 'CANDIDATE') {
            const error = new Error('UnAuthorized');
            error.statusCode = 401;
            error.result = {
                content: []
            };
            throw error;
        }
        ;
        const educationList = await education_1.Education.find({ candidateId: candidate._id.toString() });
        const returnEducationList = educationList.map(e => {
            return {
                school: e.school,
                major: e.major,
                graduatedYead: e.graduatedYear
            };
        });
        const experienceList = await experience_1.Experience.find({ candidateId: candidate._id.toString() });
        const returnExperienceList = experienceList.map(e => {
            return {
                companyName: e.companyName,
                position: e.position,
                dateFrom: e.dateFrom,
                dateTo: e.dateTo
            };
        });
        const certificateList = await certificate_1.Certificate.find({ candidateId: candidate._id.toString() });
        const returnCertificateList = certificateList.map(c => {
            return {
                name: c.name,
                receivedDate: c.receivedDate,
                url: c.url
            };
        });
        const projectList = await project_1.Project.find({ candidateId: candidate._id.toString() });
        const returnProjectList = projectList.map(p => {
            return {
                name: p.name,
                description: p.description,
                url: p.url
            };
        });
        let skills = [];
        for (let i = 0; i < candidate.skills.length; i++) {
            let skill = await skill_1.Skill.findById(candidate.skills[i].skillId);
            skills.push({
                skillId: skill?._id.toString(),
                name: skill?.name
            });
        }
        res.status(200).json({ success: true, message: "Successfully!", result: {
                education: returnEducationList,
                experience: returnExperienceList,
                certificate: returnCertificateList,
                project: returnProjectList,
                skills: skills
            } });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        next(err);
    }
};
exports.getInformation = getInformation;
const getAllInterviews = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyToken)(accessToken);
        const candidate = await user_1.User.findById(decodedToken.userId).populate('roleId');
        if (candidate?.get('roleId.roleName') !== 'CANDIDATE') {
            const error = new Error('UnAuthorized');
            error.statusCode = 401;
            error.result = {
                content: []
            };
            throw error;
        }
        ;
        const page = req.query.page ? +req.query.page : 1;
        const limit = req.query.limit ? +req.query.limit : 10;
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            const error = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = {
                content: []
            };
            throw error;
        }
        const listInterviews = await interviewerInterview_1.InterviewerInterview.aggregate([
            {
                $lookup: {
                    from: "interviews",
                    localField: "interviewId",
                    foreignField: "_id",
                    as: "interviews"
                }
            },
            {
                $match: {
                    "interviews.candidateId": new mongoose_1.default.Types.ObjectId(candidate._id.toString())
                }
            }
        ]).sort({ updatedAt: -1 }).skip((page - 1) * limit).limit(limit);
        const populateInterviewers = await interviewerInterview_1.InterviewerInterview.populate(listInterviews, {
            path: 'interviewersId',
            model: user_1.User
        });
        const populateInterviews = await interviewerInterview_1.InterviewerInterview.populate(populateInterviewers, {
            path: 'interviewId',
            model: interview_1.Interview,
            populate: {
                path: 'jobApplyId',
                model: job_1.Job,
            }
        });
        console.log('populate: ', populateInterviews);
        const interviewLength = populateInterviews.length;
        if (interviewLength === 0) {
            const error = new Error('Bạn chưa có buổi phỏng vấn nào');
            error.statusCode = 200;
            error.success = true;
            error.result = {
                content: []
            };
            throw error;
        }
        const returnListInterview = populateInterviews.map(interview => {
            let interviewersName = [];
            for (let interviewer of interview.interviewersId) {
                interviewersName.push(interviewer.fullName);
            }
            return {
                jobName: interview.interviewId.jobApplyId.name,
                time: interview.interviewId.time,
                interviewersName: interviewersName,
                interviewLink: interview.interviewId.interviewLink
            };
        });
        res.status(200).json({ success: true, message: "Successfully!", result: {
                pageNumber: page,
                totalPages: Math.ceil(interviewLength / limit),
                limit: limit,
                totalElements: interviewLength,
                content: returnListInterview
            } });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        next(err);
    }
};
exports.getAllInterviews = getAllInterviews;
