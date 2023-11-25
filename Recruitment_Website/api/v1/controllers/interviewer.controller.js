"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTypeQuestion = exports.getSkillQuestion = exports.deleteQuestion = exports.updateQuestion = exports.getSingleQuestion = exports.getAllQuestions = exports.createQuestion = exports.getSingleInterview = exports.getAllInterviews = exports.getSingleApplicant = exports.getAllApplicants = exports.getInformation = exports.saveInformation = void 0;
const utils_1 = require("../utils");
const express_validator_1 = require("express-validator");
const user_1 = require("../models/user");
const jobPosition_1 = require("../models/jobPosition");
const job_1 = require("../models/job");
const skill_1 = require("../models/skill");
const education_1 = require("../models/education");
const experience_1 = require("../models/experience");
const certificate_1 = require("../models/certificate");
const project_1 = require("../models/project");
const question_1 = require("../models/question");
const interviewerInterview_1 = require("../models/interviewerInterview");
const interview_1 = require("../models/interview");
const resumeUpload_1 = require("../models/resumeUpload");
const saveInformation = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyToken)(accessToken);
        const interviewer = await user_1.User.findById(decodedToken.userId).populate('roleId');
        if (interviewer?.get('roleId.roleName') !== 'INTERVIEWER') {
            const error = new Error('UnAuthorized');
            error.statusCode = 401;
            error.result = {
                content: []
            };
            throw error;
        }
        ;
        const { education, experience, certificate, project, skills } = req.body;
        await education_1.Education.deleteMany({ candidateId: interviewer._id.toString() });
        await experience_1.Experience.deleteMany({ candidateId: interviewer._id.toString() });
        await certificate_1.Certificate.deleteMany({ candidateId: interviewer._id.toString() });
        await project_1.Project.deleteMany({ candidateId: interviewer._id.toString() });
        interviewer.skills = [];
        await interviewer.save();
        if (education.length !== 0) {
            for (let i = 0; i < education.length; i++) {
                let e = new education_1.Education({
                    candidateId: interviewer._id.toString(),
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
                    candidateId: interviewer._id.toString(),
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
                    candidateId: interviewer._id.toString(),
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
                    candidateId: interviewer._id.toString(),
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
                interviewer.skills.push({ skillId: skill._id });
            }
            await interviewer.save();
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
        const interviewer = await user_1.User.findById(decodedToken.userId).populate('roleId');
        if (interviewer?.get('roleId.roleName') !== 'INTERVIEWER') {
            const error = new Error('UnAuthorized');
            error.statusCode = 401;
            error.result = {
                content: []
            };
            throw error;
        }
        ;
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
        let skills = [];
        for (let i = 0; i < interviewer.skills.length; i++) {
            let skill = await skill_1.Skill.findById(interviewer.skills[i].skillId);
            skills.push({
                skillId: skill?._id.toString(),
                name: skill?.name
            });
        }
        res.status(200).json({
            success: true, message: "Successfully!", result: {
                education: returnEducationList,
                experience: returnExperienceList,
                certificate: returnCertificateList,
                project: returnProjectList,
                skills: skills
            }
        });
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
const getAllApplicants = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyToken)(accessToken);
        const interviewer = await user_1.User.findById(decodedToken.userId).populate('roleId');
        if (interviewer?.get('roleId.roleName') !== 'INTERVIEWER') {
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
        const applicantLength = await interviewerInterview_1.InterviewerInterview.find({ interviewersId: interviewer._id.toString() }).countDocuments();
        if (applicantLength === 0) {
            const error = new Error('Chưa có ứng viên nào ');
            error.statusCode = 200;
            error.result = {
                content: []
            };
            throw error;
        }
        const listInterviews = await interviewerInterview_1.InterviewerInterview.find({ interviewersId: interviewer._id.toString() })
            .populate({
            path: 'interviewId',
            model: interview_1.Interview,
            populate: {
                path: 'candidateId',
                model: user_1.User,
                populate: {
                    path: 'skills.skillId',
                    model: skill_1.Skill
                }
            }
        })
            .populate({
            path: 'interviewId',
            model: interview_1.Interview,
            populate: {
                path: 'jobApplyId',
                model: job_1.Job,
                populate: {
                    path: 'positionId',
                    model: jobPosition_1.JobPosition
                }
            }
        })
            .sort({ updatedAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);
        const returnListApplicants = async () => {
            const mappedApplicants = await Promise.all(listInterviews.map(async (interview) => {
                try {
                    const cv = await resumeUpload_1.ResumeUpload.findOne({ candidateId: interview.get('interviewId.candidateId._id') });
                    const educationList = await education_1.Education.find({ candidateId: interview.get('interviewId.candidateId._id') });
                    const returnEducationList = educationList.map(e => {
                        return {
                            school: e.school,
                            major: e.major,
                            graduatedYead: e.graduatedYear
                        };
                    });
                    const experienceList = await experience_1.Experience.find({ candidateId: interview.get('interviewId.candidateId._id') });
                    const returnExperienceList = experienceList.map(e => {
                        return {
                            companyName: e.companyName,
                            position: e.position,
                            dateFrom: e.dateFrom,
                            dateTo: e.dateTo
                        };
                    });
                    const certificateList = await certificate_1.Certificate.find({ candidateId: interview.get('interviewId.candidateId._id') });
                    const returnCertificateList = certificateList.map(c => {
                        return {
                            name: c.name,
                            receivedDate: c.receivedDate,
                            url: c.url
                        };
                    });
                    const projectList = await project_1.Project.find({ candidateId: interview.get('interviewId.candidateId._id') });
                    const returnProjectList = projectList.map(p => {
                        return {
                            name: p.name,
                            description: p.description,
                            url: p.url
                        };
                    });
                    let listSkill = [];
                    for (let i = 0; i < interview.get('interviewId.candidateId.skills').length; i++) {
                        listSkill.push({ label: interview.get('interviewId.candidateId.skills')[i].skillId.name, value: i });
                    }
                    return {
                        candidateId: interview.get('interviewId.candidateId._id'),
                        candidateName: interview.get('interviewId.candidateId.fullName'),
                        position: interview.get('interviewId.jobApplyId.positionId.name'),
                        interviewId: interview.interviewId._id.toString(),
                        date: interview.get('interviewId.time'),
                        state: interview.get('interviewId.state'),
                        jobName: interview.get('interviewId.jobApplyId.name'),
                        avatar: interview.get('interviewId.candidateId.avatar.url'),
                        address: interview.get('interviewId.candidateId.address'),
                        about: interview.get('interviewId.candidateId.about'),
                        dateOfBirth: interview.get('interviewId.candidateId.dateOfBirth'),
                        phone: interview.get('interviewId.candidateId.phone'),
                        email: interview.get('interviewId.candidateId.email'),
                        cv: cv?.resumeUpload,
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
        returnListApplicants().then(mappedApplicants => {
            res.status(200).json({
                success: true, message: "Successfully!", result: {
                    pageNumber: page,
                    totalPages: Math.ceil(applicantLength / limit),
                    limit: limit,
                    totalElements: applicantLength,
                    content: mappedApplicants
                }
            });
        });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        next(err);
    }
};
exports.getAllApplicants = getAllApplicants;
const getSingleApplicant = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyToken)(accessToken);
        const interviewer = await user_1.User.findById(decodedToken.userId).populate('roleId');
        if (interviewer?.get('roleId.roleName') !== 'INTERVIEWER') {
            const error = new Error('UnAuthorized');
            error.statusCode = 401;
            error.result = null;
            throw error;
        }
        ;
        const candidateId = req.params.candidateId;
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            const error = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        const candidate = await user_1.User.findById(candidateId).populate('skills.skillId');
        if (!candidate) {
            const error = new Error('Không tìm thấy ứng viên.');
            error.statusCode = 409;
            error.result = null;
            throw error;
        }
        const cv = await resumeUpload_1.ResumeUpload.findOne({ candidateId: candidate._id.toString() });
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
        let listSkill = [];
        for (let i = 0; i < candidate.skills.length; i++) {
            listSkill.push({ label: candidate.skills[i].skillId.name, value: i });
        }
        const returnCandidate = {
            candidateId: candidate._id.toString(),
            candidateName: candidate.fullName,
            avatar: candidate.avatar?.url,
            address: candidate.address,
            about: candidate.about,
            dateOfBirth: candidate.dateOfBirth,
            phone: candidate.phone,
            email: candidate.email,
            cv: cv?.resumeUpload,
            information: {
                education: returnEducationList,
                experience: returnExperienceList,
                certificate: returnCertificateList,
                project: returnProjectList,
                skills: listSkill
            }
        };
        res.status(200).json({ success: true, message: 'Get applicant successfully.', result: returnCandidate });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        next(err);
    }
};
exports.getSingleApplicant = getSingleApplicant;
const getAllInterviews = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyToken)(accessToken);
        const interviewer = await user_1.User.findById(decodedToken.userId).populate('roleId');
        if (interviewer?.get('roleId.roleName') !== 'INTERVIEWER') {
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
        const interviewLength = await interviewerInterview_1.InterviewerInterview.find({ interviewersId: interviewer._id.toString() }).countDocuments();
        if (interviewLength === 0) {
            const error = new Error('Chưa có buổi phỏng vấn nào.');
            error.statusCode = 200;
            error.result = {
                content: []
            };
            throw error;
        }
        const listInterviews = await interviewerInterview_1.InterviewerInterview.find({ interviewersId: interviewer._id.toString() })
            .populate({
            path: 'interviewId',
            model: interview_1.Interview,
            populate: {
                path: 'jobApplyId',
                model: job_1.Job,
                populate: {
                    path: 'positionId',
                    model: jobPosition_1.JobPosition
                }
            }
        })
            .sort({ updatedAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);
        const returnListInterviews = listInterviews.map(interview => {
            return {
                interviewId: interview.interviewId._id.toString(),
                interviewLink: interview.get('interviewId.interviewLink'),
                date: interview.get('interviewId.time'),
                position: interview.get('interviewId.jobApplyId.positionId.name'),
                state: interview.get('interviewId.state')
            };
        });
        res.status(200).json({ success: true, message: "Get list interview Successfully!", result: {
                pageNumber: page,
                totalPages: Math.ceil(interviewLength / limit),
                limit: limit,
                totalElements: interviewLength,
                content: returnListInterviews
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
const getSingleInterview = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyToken)(accessToken);
        const interviewer = await user_1.User.findById(decodedToken.userId).populate('roleId');
        if (interviewer?.get('roleId.roleName') !== 'INTERVIEWER') {
            const error = new Error('UnAuthorized');
            error.statusCode = 401;
            error.result = null;
            throw error;
        }
        ;
        const interviewId = req.params.interviewId;
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            const error = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        const interview = await interviewerInterview_1.InterviewerInterview.findOne({ interviewersId: interviewer._id.toString(), interviewId: interviewId })
            .populate({
            path: 'interviewId',
            model: interview_1.Interview,
            populate: {
                path: 'jobApplyId',
                model: job_1.Job,
                populate: {
                    path: 'positionId',
                    model: jobPosition_1.JobPosition
                }
            }
        })
            .populate({
            path: 'interviewId',
            model: interview_1.Interview,
            populate: {
                path: 'candidateId',
                model: user_1.User,
                populate: {
                    path: 'skills.skillId',
                    model: skill_1.Skill
                }
            }
        });
        if (!interview) {
            const error = new Error('Không tìm thấy interview');
            error.statusCode = 401;
            error.result = null;
            throw error;
        }
        const cv = await resumeUpload_1.ResumeUpload.findOne({ candidateId: interview.get('interviewId.candidateId._id') });
        const educationList = await education_1.Education.find({ candidateId: interview.get('interviewId.candidateId._id') });
        const returnEducationList = educationList.map(e => {
            return {
                school: e.school,
                major: e.major,
                graduatedYead: e.graduatedYear
            };
        });
        const experienceList = await experience_1.Experience.find({ candidateId: interview.get('interviewId.candidateId._id') });
        const returnExperienceList = experienceList.map(e => {
            return {
                companyName: e.companyName,
                position: e.position,
                dateFrom: e.dateFrom,
                dateTo: e.dateTo
            };
        });
        const certificateList = await certificate_1.Certificate.find({ candidateId: interview.get('interviewId.candidateId._id') });
        const returnCertificateList = certificateList.map(c => {
            return {
                name: c.name,
                receivedDate: c.receivedDate,
                url: c.url
            };
        });
        const projectList = await project_1.Project.find({ candidateId: interview.get('interviewId.candidateId._id') });
        const returnProjectList = projectList.map(p => {
            return {
                name: p.name,
                description: p.description,
                url: p.url
            };
        });
        let listSkill = [];
        for (let i = 0; i < interview.get('interviewId.candidateId').skills.length; i++) {
            listSkill.push({ label: interview.get('interviewId.candidateId').skills[i].skillId.name, value: i });
        }
        const returnInterview = {
            interviewId: interview.interviewId._id.toString(),
            jobName: interview.get('interviewId.jobApplyId.name'),
            position: interview.get('interviewId.jobApplyId.positionId.name'),
            Date: interview.get('interviewId.time'),
            interviewLink: interview.get('interviewId.interviewLink'),
            questions: [],
            candidate: {
                candidateId: interview.get('interviewId.candidateId._id'),
                candidateName: interview.get('interviewId.candidateId.fullName'),
                email: interview.get('interviewId.candidateId.email'),
                phone: interview.get('interviewId.candidateId.phone'),
                about: interview.get('interviewId.candidateId.about'),
                address: interview.get('interviewId.candidateId.address'),
                dateOfBirth: interview.get('interviewId.candidateId.dateOfBirth'),
                information: {
                    education: returnEducationList,
                    experience: returnExperienceList,
                    certificate: returnCertificateList,
                    project: returnProjectList,
                    skills: listSkill
                }
            }
        };
        console.log(interview);
        res.status(200).json({ success: true, message: "Get interview Successfully!", result: returnInterview });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        next(err);
    }
};
exports.getSingleInterview = getSingleInterview;
const createQuestion = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyToken)(accessToken);
        const interviewer = await user_1.User.findById(decodedToken.userId).populate('roleId');
        if (interviewer?.get('roleId.roleName') !== 'INTERVIEWER') {
            const error = new Error('UnAuthorized');
            error.statusCode = 401;
            error.result = null;
            throw error;
        }
        ;
        const { content, type, skill, note } = req.body;
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            const error = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        const questionSKill = await skill_1.Skill.findOne({ name: skill });
        const question = new question_1.Question({
            interviewerId: interviewer._id.toString(),
            content: content,
            typeQuestion: type,
            skillId: questionSKill?._id.toString(),
            note: note
        });
        await question.save();
        res.status(200).json({ success: true, message: 'Create question successfully.', result: null });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        next(err);
    }
};
exports.createQuestion = createQuestion;
const getAllQuestions = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyToken)(accessToken);
        const interviewer = await user_1.User.findById(decodedToken.userId).populate('roleId');
        if (interviewer?.get('roleId.roleName') !== 'INTERVIEWER') {
            const error = new Error('UnAuthorized');
            error.statusCode = 401;
            error.result = {
                content: []
            };
            throw error;
        }
        ;
        const { skill, type } = req.query;
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
        const query = {
            interviewerId: interviewer._id.toString()
        };
        if (skill) {
            const skillId = await skill_1.Skill.findOne({ name: skill });
            query['skillId'] = skillId?._id;
        }
        if (type) {
            query['typeQuestion'] = type;
        }
        const questionLength = await question_1.Question.find(query).countDocuments();
        if (questionLength === 0) {
            const error = new Error('Không tìm thấy câu hỏi');
            error.statusCode = 200;
            error.success = true;
            error.result = {
                content: []
            };
            throw error;
        }
        ;
        const listQuestions = await question_1.Question.find(query).populate('skillId')
            .sort({ updatedAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);
        const returnListQuestions = listQuestions.map(question => {
            return {
                questionId: question._id.toString(),
                content: question.content,
                typeQuestion: question.typeQuestion,
                skill: question.get('skillId.name'),
                note: question.note
            };
        });
        res.status(200).json({
            success: true, message: 'Get list questions successfully.', result: {
                pageNumber: page,
                totalPages: Math.ceil(questionLength / limit),
                limit: limit,
                totalElements: questionLength,
                content: returnListQuestions
            }
        });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        next(err);
    }
};
exports.getAllQuestions = getAllQuestions;
const getSingleQuestion = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyToken)(accessToken);
        const interviewer = await user_1.User.findById(decodedToken.userId).populate('roleId');
        if (interviewer?.get('roleId.roleName') !== 'INTERVIEWER') {
            const error = new Error('UnAuthorized');
            error.statusCode = 401;
            error.result = null;
            throw error;
        }
        ;
        const questionId = req.params.questionId;
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            const error = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        const question = await question_1.Question.findById(questionId).populate('skillId');
        if (!question) {
            const error = new Error('Không tìm thấy câu hỏi');
            error.statusCode = 409;
            error.result = null;
            throw error;
        }
        const returnQuestion = {
            questionId: question._id.toString(),
            content: question.content,
            typeQuestion: question.typeQuestion,
            skill: question.get('skillId.name'),
            note: question.note
        };
        res.status(200).json({ success: true, message: 'Get question successfully.', result: returnQuestion });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        next(err);
    }
};
exports.getSingleQuestion = getSingleQuestion;
const updateQuestion = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyToken)(accessToken);
        const interviewer = await user_1.User.findById(decodedToken.userId).populate('roleId');
        if (interviewer?.get('roleId.roleName') !== 'INTERVIEWER') {
            const error = new Error('UnAuthorized');
            error.statusCode = 401;
            error.result = null;
            throw error;
        }
        ;
        const questionId = req.params.questionId;
        const { content, type, skill, note } = req.body;
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            const error = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        const questionSKill = await skill_1.Skill.findOne({ name: skill });
        const question = await question_1.Question.findById(questionId);
        if (!question) {
            const error = new Error('Không tìm thấy câu hỏi');
            error.statusCode = 409;
            error.result = null;
            throw error;
        }
        question.content = content;
        question.typeQuestion = type;
        question.skillId = questionSKill._id;
        question.note = note;
        await question.save();
        res.status(200).json({ success: true, message: 'Update question successfully.', result: null });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        next(err);
    }
};
exports.updateQuestion = updateQuestion;
const deleteQuestion = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyToken)(accessToken);
        const interviewer = await user_1.User.findById(decodedToken.userId).populate('roleId');
        if (interviewer?.get('roleId.roleName') !== 'INTERVIEWER') {
            const error = new Error('UnAuthorized');
            error.statusCode = 401;
            error.result = null;
            throw error;
        }
        ;
        const questionId = req.params.questionId;
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            const error = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        const question = await question_1.Question.findById(questionId);
        if (!question) {
            const error = new Error('Không tìm thấy câu hỏi');
            error.statusCode = 409;
            error.result = null;
            throw error;
        }
        await question_1.Question.findByIdAndDelete(questionId);
        res.status(200).json({ success: true, message: 'Delete question successfully.', result: null });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        next(err);
    }
};
exports.deleteQuestion = deleteQuestion;
const getSkillQuestion = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyToken)(accessToken);
        const interviewer = await user_1.User.findById(decodedToken.userId).populate('roleId');
        if (interviewer?.get('roleId.roleName') !== 'INTERVIEWER') {
            const error = new Error('UnAuthorized');
            error.statusCode = 401;
            error.result = null;
            throw error;
        }
        ;
        const skills = await skill_1.Skill.find();
        const returnSkills = skills.map(skill => {
            return skill.name;
        });
        res.status(200).json({ success: true, message: 'Get question skills successfully.', result: returnSkills });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        next(err);
    }
};
exports.getSkillQuestion = getSkillQuestion;
const getTypeQuestion = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyToken)(accessToken);
        const interviewer = await user_1.User.findById(decodedToken.userId).populate('roleId');
        if (interviewer?.get('roleId.roleName') !== 'INTERVIEWER') {
            const error = new Error('UnAuthorized');
            error.statusCode = 401;
            error.result = null;
            throw error;
        }
        ;
        const returnType = utils_1.questionType;
        res.status(200).json({ success: true, message: 'Get question type successfully.', result: returnType });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        next(err);
    }
};
exports.getTypeQuestion = getTypeQuestion;
