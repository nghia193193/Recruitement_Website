"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.interviewerStatistics = exports.submitTotalScore = exports.deleteAssignQuestion = exports.updateQuestions = exports.assignQuestions = exports.getAssignQuestions = exports.getSkillQuestion = exports.deleteQuestion = exports.updateQuestion = exports.getSingleQuestion = exports.getAllQuestions = exports.createQuestion = exports.getSingleInterview = exports.getAllInterviews = exports.getSingleApplicant = exports.getAllApplicants = exports.getInformation = exports.saveInformation = void 0;
const user_1 = require("../models/user");
const questionCandidate_1 = require("../models/questionCandidate");
const question_1 = require("../models/question");
const skill_1 = require("../models/skill");
const interviewerInterview_1 = require("../models/interviewerInterview");
const interview_1 = require("../models/interview");
const job_1 = require("../models/job");
const jobPosition_1 = require("../models/jobPosition");
const education_1 = require("../models/education");
const experience_1 = require("../models/experience");
const certificate_1 = require("../models/certificate");
const project_1 = require("../models/project");
const jobApply_1 = require("../models/jobApply");
const utils_1 = require("../utils");
const mongoose_1 = __importDefault(require("mongoose"));
const saveInformation = async (interviewerId, education, experience, certificate, project, skills) => {
    const interviewer = await user_1.User.findById(interviewerId).populate('roleId');
    if (interviewer?.get('roleId.roleName') !== 'INTERVIEWER') {
        const error = new Error('UnAuthorized');
        error.statusCode = 401;
        error.result = {
            content: []
        };
        throw error;
    }
    ;
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
};
exports.saveInformation = saveInformation;
const getInformation = async (interviewerId) => {
    const interviewer = await user_1.User.findById(interviewerId).populate('roleId');
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
    return {
        education: returnEducationList,
        experience: returnExperienceList,
        certificate: returnCertificateList,
        project: returnProjectList,
        skills: skills
    };
};
exports.getInformation = getInformation;
const getAllApplicants = async (interviewerId, page, limit) => {
    const interviewer = await user_1.User.findById(interviewerId).populate('roleId');
    if (interviewer?.get('roleId.roleName') !== 'INTERVIEWER') {
        const error = new Error('UnAuthorized');
        error.statusCode = 401;
        error.result = {
            content: []
        };
        throw error;
    }
    ;
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
        .populate('interviewersId')
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
    const returnListApplicants = async () => {
        const mappedApplicants = await Promise.all(listInterviews.map(async (interview) => {
            try {
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
                const jobApply = await jobApply_1.JobApply.findOne({ candidateId: interview.get('interviewId.candidateId._id'), jobAppliedId: interview.get('interviewId.jobApplyId._id') }).populate('resumeId');
                const interviewerFullNames = interview.interviewersId.map(interviewer => {
                    return interviewer.fullName;
                });
                const scoreInterviewer = await questionCandidate_1.QuestionCandidate.find({ interviewId: interview.interviewId._id.toString() });
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
                    candidateId: interview.get('interviewId.candidateId._id'),
                    candidateFullName: interview.get('interviewId.candidateId.fullName'),
                    position: interview.get('interviewId.jobApplyId.positionId.name'),
                    interviewId: interview.interviewId._id.toString(),
                    interviewerFullNames: interviewerFullNames,
                    date: interview.get('interviewId.time'),
                    state: jobApply?.status,
                    score: totalScore,
                    jobName: interview.get('interviewId.jobApplyId.name'),
                    avatar: interview.get('interviewId.candidateId.avatar.url'),
                    address: interview.get('interviewId.candidateId.address'),
                    about: interview.get('interviewId.candidateId.about'),
                    dateOfBirth: interview.get('interviewId.candidateId.dateOfBirth'),
                    phone: interview.get('interviewId.candidateId.phone'),
                    email: interview.get('interviewId.candidateId.email'),
                    cv: jobApply?.get('resumeId.resumeUpload'),
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
    const listApplicants = await returnListApplicants().then(mappedApplicants => {
        return mappedApplicants;
    });
    return { applicantLength, listApplicants };
};
exports.getAllApplicants = getAllApplicants;
const getSingleApplicant = async (interviewerId, candidateId) => {
    const interviewer = await user_1.User.findById(interviewerId).populate('roleId');
    if (interviewer?.get('roleId.roleName') !== 'INTERVIEWER') {
        const error = new Error('UnAuthorized');
        error.statusCode = 401;
        error.result = null;
        throw error;
    }
    ;
    const candidate = await user_1.User.findById(candidateId).populate('skills.skillId');
    if (!candidate) {
        const error = new Error('Không tìm thấy ứng viên.');
        error.statusCode = 409;
        error.result = null;
        throw error;
    }
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
        information: {
            education: returnEducationList,
            experience: returnExperienceList,
            certificate: returnCertificateList,
            project: returnProjectList,
            skills: listSkill
        }
    };
    return returnCandidate;
};
exports.getSingleApplicant = getSingleApplicant;
const getAllInterviews = async (interviewerId, page, limit) => {
    const interviewer = await user_1.User.findById(interviewerId).populate('roleId');
    if (interviewer?.get('roleId.roleName') !== 'INTERVIEWER') {
        const error = new Error('UnAuthorized');
        error.statusCode = 401;
        error.result = {
            content: []
        };
        throw error;
    }
    ;
    const interviewLength = await interviewerInterview_1.InterviewerInterview.find({ interviewersId: interviewer._id.toString() }).countDocuments();
    if (interviewLength === 0) {
        const error = new Error('Chưa có buổi phỏng vấn nào.');
        error.statusCode = 200;
        error.result = {
            content: []
        };
        throw error;
    }
    const listInterviews = await interviewerInterview_1.InterviewerInterview.aggregate([
        { $match: { interviewersId: new mongoose_1.default.Types.ObjectId(interviewer._id.toString()) } },
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
                from: 'jobpositions',
                localField: 'jobs.positionId',
                foreignField: '_id',
                as: 'positions'
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'interviewersId',
                foreignField: '_id',
                as: 'interviewers'
            }
        },
        { $sort: { 'interviews.updatedAt': -1 } },
        { $skip: (page - 1) * limit },
        { $limit: limit }
    ]);
    const returnListInterviews = listInterviews.map(interview => {
        const listInterviewers = interview.interviewers.map((interviewer) => {
            return interviewer.fullName;
        });
        return {
            interviewId: interview.interviewId._id.toString(),
            interviewerInterviewUpdatedAt: interview.updatedAt,
            interviewUpdatedAt: interview.interviews[0].updatedAt,
            jobName: interview.jobs[0].name,
            interviewLink: interview.interviews[0].interviewLink,
            time: interview.interviews[0].time,
            position: interview.positions[0].name,
            state: interview.interviews[0].state,
            interviewersFullName: listInterviewers
        };
    });
    return { interviewLength, returnListInterviews };
};
exports.getAllInterviews = getAllInterviews;
const getSingleInterview = async (interviewerId, interviewId) => {
    const interviewer = await user_1.User.findById(interviewerId).populate('roleId');
    if (interviewer?.get('roleId.roleName') !== 'INTERVIEWER') {
        const error = new Error('UnAuthorized');
        error.statusCode = 401;
        error.result = null;
        throw error;
    }
    ;
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
    const jobApply = await jobApply_1.JobApply.findOne({ candidateId: interview.get('interviewId.candidateId._id'), jobAppliedId: interview.get('interviewId.jobApplyId._id') }).populate('resumeId');
    const returnInterview = {
        interviewId: interview.interviewId._id.toString(),
        jobName: interview.get('interviewId.jobApplyId.name'),
        position: interview.get('interviewId.jobApplyId.positionId.name'),
        Date: interview.get('interviewId.time'),
        interviewLink: interview.get('interviewId.interviewLink'),
        questions: [],
        candidate: {
            candidateId: interview.get('interviewId.candidateId._id'),
            candidateFullName: interview.get('interviewId.candidateId.fullName'),
            avatar: interview.get('interviewId.candidateId.avatar.url'),
            email: interview.get('interviewId.candidateId.email'),
            phone: interview.get('interviewId.candidateId.phone'),
            about: interview.get('interviewId.candidateId.about'),
            address: interview.get('interviewId.candidateId.address'),
            dateOfBirth: interview.get('interviewId.candidateId.dateOfBirth'),
            cv: jobApply?.get('resumeId.resumeUpload') ? jobApply?.get('resumeId.resumeUpload') : null,
            information: {
                education: returnEducationList,
                experience: returnExperienceList,
                certificate: returnCertificateList,
                project: returnProjectList,
                skills: listSkill
            }
        }
    };
    return returnInterview;
};
exports.getSingleInterview = getSingleInterview;
const createQuestion = async (interviewerId, content, type, skill, note) => {
    const interviewer = await user_1.User.findById(interviewerId).populate('roleId');
    if (interviewer?.get('roleId.roleName') !== 'INTERVIEWER') {
        const error = new Error('UnAuthorized');
        error.statusCode = 401;
        error.result = null;
        throw error;
    }
    ;
    const questionSKill = await skill_1.Skill.findOne({ name: skill });
    const question = new question_1.Question({
        interviewerId: interviewer._id.toString(),
        content: content,
        typeQuestion: type,
        skillId: questionSKill?._id.toString(),
        note: note
    });
    await question.save();
    return {
        questionId: question._id.toString(),
        content: content,
        typeQuestion: type,
        skill: skill,
        note: note
    };
};
exports.createQuestion = createQuestion;
const getAllQuestions = async (interviewerId, skill, type, content, page, limit) => {
    const interviewer = await user_1.User.findById(interviewerId).populate('roleId');
    if (interviewer?.get('roleId.roleName') !== 'INTERVIEWER') {
        const error = new Error('UnAuthorized');
        error.statusCode = 401;
        error.result = {
            content: []
        };
        throw error;
    }
    ;
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
    if (content) {
        query['content'] = new RegExp(content, 'i');
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
    return { questionLength, returnListQuestions };
};
exports.getAllQuestions = getAllQuestions;
const getSingleQuestion = async (interviewerId, questionId) => {
    const interviewer = await user_1.User.findById(interviewerId).populate('roleId');
    if (interviewer?.get('roleId.roleName') !== 'INTERVIEWER') {
        const error = new Error('UnAuthorized');
        error.statusCode = 401;
        error.result = null;
        throw error;
    }
    ;
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
    return returnQuestion;
};
exports.getSingleQuestion = getSingleQuestion;
const updateQuestion = async (interviewerId, questionId, content, type, skill, note) => {
    const interviewer = await user_1.User.findById(interviewerId).populate('roleId');
    if (interviewer?.get('roleId.roleName') !== 'INTERVIEWER') {
        const error = new Error('UnAuthorized');
        error.statusCode = 401;
        error.result = null;
        throw error;
    }
    ;
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
};
exports.updateQuestion = updateQuestion;
const deleteQuestion = async (interviewerId, questionId) => {
    const interviewer = await user_1.User.findById(interviewerId).populate('roleId');
    if (interviewer?.get('roleId.roleName') !== 'INTERVIEWER') {
        const error = new Error('UnAuthorized');
        error.statusCode = 401;
        error.result = null;
        throw error;
    }
    ;
    const question = await question_1.Question.findById(questionId);
    if (!question) {
        const error = new Error('Không tìm thấy câu hỏi');
        error.statusCode = 409;
        error.result = null;
        throw error;
    }
    const interviewQuestion = await questionCandidate_1.QuestionCandidate.findOne({ 'questions.questionId': questionId });
    if (interviewQuestion) {
        const error = new Error('Câu hỏi này đã tồn tại trong buổi phỏng phấn không thể xóa!');
        error.statusCode = 409;
        error.result = null;
        throw error;
    }
    await question_1.Question.findByIdAndDelete(questionId);
};
exports.deleteQuestion = deleteQuestion;
const getSkillQuestion = async (interviewerId) => {
    const interviewer = await user_1.User.findById(interviewerId).populate('roleId');
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
    return returnSkills;
};
exports.getSkillQuestion = getSkillQuestion;
const getAssignQuestions = async (interviewerId, interviewId) => {
    const interviewer = await user_1.User.findById(interviewerId).populate('roleId');
    if (interviewer?.get('roleId.roleName') !== 'INTERVIEWER') {
        const error = new Error('UnAuthorized');
        error.statusCode = 401;
        error.result = [];
        throw error;
    }
    ;
    const questionCandidate = await questionCandidate_1.QuestionCandidate.findOne({ interviewId: interviewId, owner: interviewer._id.toString() })
        .populate({
        path: 'questions.questionId',
        model: question_1.Question,
        populate: {
            path: 'skillId',
            model: skill_1.Skill
        }
    });
    if (!questionCandidate) {
        const error = new Error('Không tìm thấy câu hỏi đã đặt');
        error.statusCode = 409;
        error.result = [];
        throw error;
    }
    const returnQuestions = questionCandidate.questions.map(question => {
        return {
            questionId: question.questionId._id.toString(),
            content: question.questionId.content,
            typeQuestion: question.questionId.typeQuestion,
            skill: question.questionId.skillId.name,
            note: question.note ? question.note : null,
            score: question.score ? question.score : null
        };
    });
    return returnQuestions;
};
exports.getAssignQuestions = getAssignQuestions;
const assignQuestions = async (interviewerId, questions, interviewId) => {
    const interviewer = await user_1.User.findById(interviewerId).populate('roleId');
    if (interviewer?.get('roleId.roleName') !== 'INTERVIEWER') {
        const error = new Error('UnAuthorized');
        error.statusCode = 401;
        error.result = null;
        throw error;
    }
    ;
    const questionCandidate = await questionCandidate_1.QuestionCandidate.findOne({ interviewId: interviewId, owner: interviewer._id.toString() });
    if (!questionCandidate) {
        const questionCandidate = new questionCandidate_1.QuestionCandidate({
            interviewId: interviewId,
            questions: questions,
            owner: interviewer._id.toString(),
        });
        await questionCandidate.save();
    }
    else {
        for (let i = 0; i < questions.length; i++) {
            questionCandidate.questions.push(questions[i]);
        }
        await questionCandidate.save();
    }
};
exports.assignQuestions = assignQuestions;
const updateQuestions = async (interviewerId, questions, interviewId) => {
    const interviewer = await user_1.User.findById(interviewerId).populate('roleId');
    if (interviewer?.get('roleId.roleName') !== 'INTERVIEWER') {
        const error = new Error('UnAuthorized');
        error.statusCode = 401;
        error.result = null;
        throw error;
    }
    ;
    const questionCandidate = await questionCandidate_1.QuestionCandidate.findOne({ interviewId: interviewId, owner: interviewer._id.toString() });
    if (!questionCandidate) {
        const error = new Error('Không tìm thấy câu hỏi đã đặt');
        error.statusCode = 409;
        error.result = null;
        throw error;
    }
    questionCandidate.questions = questions;
    await questionCandidate.save();
};
exports.updateQuestions = updateQuestions;
const deleteAssignQuestion = async (interviewerId, questionId, interviewId) => {
    const interviewer = await user_1.User.findById(interviewerId).populate('roleId');
    if (interviewer?.get('roleId.roleName') !== 'INTERVIEWER') {
        const error = new Error('UnAuthorized');
        error.statusCode = 401;
        error.result = null;
        throw error;
    }
    const questionCandidate = await questionCandidate_1.QuestionCandidate.findOne({
        interviewId: interviewId,
        owner: interviewer._id.toString(),
    });
    if (!questionCandidate) {
        const error = new Error('Không tìm thấy câu hỏi đã đặt');
        error.statusCode = 409;
        error.result = null;
        throw error;
    }
    questionCandidate.questions = questionCandidate.questions.filter((question) => {
        return question.questionId?.toString() !== questionId;
    });
    await questionCandidate.save();
};
exports.deleteAssignQuestion = deleteAssignQuestion;
const submitTotalScore = async (interviewerId, interviewId) => {
    const interviewer = await user_1.User.findById(interviewerId).populate('roleId');
    if (interviewer?.get('roleId.roleName') !== 'INTERVIEWER') {
        const error = new Error('UnAuthorized');
        error.statusCode = 401;
        error.result = null;
        throw error;
    }
    const questionCandidate = await questionCandidate_1.QuestionCandidate.findOne({
        interviewId: interviewId,
        owner: interviewer._id.toString(),
    });
    if (!questionCandidate) {
        const error = new Error('Không tìm thấy câu hỏi đã đặt');
        error.statusCode = 409;
        error.result = null;
        throw error;
    }
    const score = questionCandidate.questions.reduce((totalScore, question) => {
        if (question.score) {
            return totalScore + question.score;
        }
        else
            return totalScore + 0;
    }, 0);
    const submitScore = `${score}/${questionCandidate.questions.length * 10}`;
    questionCandidate.totalScore = submitScore;
    await questionCandidate.save();
    const interview = await interview_1.Interview.findById(interviewId);
    if (!interview) {
        const error = new Error('Không tìm thấy buổi phỏng vấn');
        error.statusCode = 409;
        error.result = null;
        throw error;
    }
    interview.state = "COMPLETED";
    await interview.save();
};
exports.submitTotalScore = submitTotalScore;
const interviewerStatistics = async (interviewerId) => {
    const interviewer = await user_1.User.findById(interviewerId).populate('roleId');
    if (interviewer?.get('roleId.roleName') !== 'INTERVIEWER') {
        const error = new Error('UnAuthorized');
        error.statusCode = 401;
        error.result = null;
        throw error;
    }
    const interviewNumber = await interviewerInterview_1.InterviewerInterview.find({ interviewersId: interviewer._id.toString() }).countDocuments();
    const interviewQuestion = await questionCandidate_1.QuestionCandidate.find({ owner: interviewer._id.toString() });
    let contributedQuestionNumber;
    if (!interviewQuestion) {
        contributedQuestionNumber = 0;
    }
    else {
        contributedQuestionNumber = interviewQuestion.reduce((totalQuestion, interview) => {
            return totalQuestion + interview.questions.length;
        }, 0);
    }
    const scoredInterviewNumber = await questionCandidate_1.QuestionCandidate.find({ owner: interviewer._id.toString(), totalScore: { $exists: true } }).countDocuments();
    const incompleteInterviewNumber = interviewNumber - scoredInterviewNumber;
    return { interviewNumber, contributedQuestionNumber, scoredInterviewNumber, incompleteInterviewNumber };
};
exports.interviewerStatistics = interviewerStatistics;
