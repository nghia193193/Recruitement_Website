"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInformation = exports.saveInformation = void 0;
const utils_1 = require("../utils");
const user_1 = require("../models/user");
const skill_1 = require("../models/skill");
const education_1 = require("../models/education");
const experience_1 = require("../models/experience");
const certificate_1 = require("../models/certificate");
const project_1 = require("../models/project");
const saveInformation = async (req, res, next) => {
    const authHeader = req.get('Authorization');
    const accessToken = authHeader.split(' ')[1];
    try {
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
    const authHeader = req.get('Authorization');
    const accessToken = authHeader.split(' ')[1];
    try {
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
