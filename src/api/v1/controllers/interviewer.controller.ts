import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { secretKey, verifyToken, transporter } from '../utils';
import { validationResult } from 'express-validator';
import { User } from '../models/user';
import { JobPosition } from '../models/jobPosition';
import { Job } from '../models/job';
import { JobType } from '../models/jobType';
import { JobLocation } from '../models/jobLocation';
import { Skill } from '../models/skill';
import { Event } from '../models/event';
import {UploadedFile} from 'express-fileupload';
import {v2 as cloudinary} from 'cloudinary';
import { Role } from '../models/role';
import { JobApply } from '../models/jobApply';
import { Education } from '../models/education';
import { Experience } from '../models/experience';
import { Certificate } from '../models/certificate';
import { Project } from '../models/project';
import { Question } from '../models/question';

export const saveInformation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.get('Authorization') as string;
        const accessToken = authHeader.split(' ')[1];
        const decodedToken: any = await verifyToken(accessToken);
        const interviewer = await User.findById(decodedToken.userId).populate('roleId');
        if (interviewer?.get('roleId.roleName') !== 'INTERVIEWER') {
            const error: Error & {statusCode?: number, result?: any} = new Error('UnAuthorized');
            error.statusCode = 401;
            error.result = {
                content: []
            };
            throw error;
        };
        const {education, experience, certificate, project, skills} = req.body;
        await Education.deleteMany({candidateId: interviewer._id.toString()});
        await Experience.deleteMany({candidateId: interviewer._id.toString()});
        await Certificate.deleteMany({candidateId: interviewer._id.toString()});
        await Project.deleteMany({candidateId: interviewer._id.toString()});
        interviewer.skills = [];
        await interviewer.save();
        if (education.length !== 0) {
            for (let i=0; i<education.length; i++) {
                let e = new Education({
                    candidateId: interviewer._id.toString(),
                    school: education[i].school,
                    major: education[i].major,
                    graduatedYear: education[i].graduatedYear
                })
                await e.save();
            }
        }
        if (experience.length !== 0) {
            for (let i=0; i<experience.length; i++) {
                let e = new Experience({
                    candidateId: interviewer._id.toString(),
                    companyName: experience[i].companyName,
                    position: experience[i].position,
                    dateFrom: experience[i].dateFrom,
                    dateTo: experience[i].dateTo
                })
                await e.save();
            }
        }
        if (certificate.length !== 0) {
            for (let i=0; i<certificate.length; i++) {
                let c = new Certificate({
                    candidateId: interviewer._id.toString(),
                    name: certificate[i].name,
                    receivedDate: certificate[i].receivedDate,
                    url: certificate[i].url,
                })
                await c.save();
            }
        }
        if (project.length !== 0) {
            for (let i=0; i<project.length; i++) {
                let p = new Project({
                    candidateId: interviewer._id.toString(),
                    name: project[i].name,
                    description: project[i].description,
                    url: project[i].url,
                })
                await p.save();
            }
        }
        if (skills.length !== 0) {
            for (let i=0; i<skills.length; i++) {
                let skill = await Skill.findOne({name: skills[i].label});
                interviewer.skills.push({skillId: (skill as any)._id});
            }
            await interviewer.save();
        }
        res.status(200).json({success: true, message: "Successfully!", result: null});
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null;
        }
        next(err);
    }
};

export const getInformation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.get('Authorization') as string;
        const accessToken = authHeader.split(' ')[1];
        const decodedToken: any = await verifyToken(accessToken);
        const interviewer = await User.findById(decodedToken.userId).populate('roleId');
        if (interviewer?.get('roleId.roleName') !== 'INTERVIEWER') {
            const error: Error & {statusCode?: number, result?: any} = new Error('UnAuthorized');
            error.statusCode = 401;
            error.result = {
                content: []
            };
            throw error;
        };
        const educationList = await Education.find({candidateId: interviewer._id.toString()});
        const returnEducationList = educationList.map(e => {
            return {
                school: e.school,
                major: e.major,
                graduatedYead: e.graduatedYear
            }
        })
        const experienceList = await Experience.find({candidateId: interviewer._id.toString()});
        const returnExperienceList = experienceList.map(e => {
            return {
                companyName: e.companyName,
                position: e.position,
                dateFrom: e.dateFrom,
                dateTo: e.dateTo
            }
        })
        const certificateList = await Certificate.find({candidateId: interviewer._id.toString()});
        const returnCertificateList = certificateList.map(c => {
            return {
                name: c.name,
                receivedDate: c.receivedDate,
                url: c.url
            }
        })
        const projectList = await Project.find({candidateId: interviewer._id.toString()});
        const returnProjectList = projectList.map(p => {
            return {
                name: p.name,
                description: p.description,
                url: p.url
            }
        })
        let skills = [];
        for (let i=0; i<interviewer.skills.length; i++) {
            let skill = await Skill.findById(interviewer.skills[i].skillId);
            skills.push({
                skillId: skill?._id.toString(),
                name: skill?.name
            });
        } 
        res.status(200).json({success: true, message: "Successfully!", result: {
            education: returnEducationList,
            experience: returnExperienceList,
            certificate: returnCertificateList,
            project: returnProjectList,
            skills: skills
        }});
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null;
        }
        next(err);
    }
};

export const createQuestion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.get('Authorization') as string;
        const accessToken = authHeader.split(' ')[1];
        const decodedToken: any = await verifyToken(accessToken);
        const interviewer = await User.findById(decodedToken.userId).populate('roleId');
        if (interviewer?.get('roleId.roleName') !== 'INTERVIEWER') {
            const error: Error & {statusCode?: number, result?: any} = new Error('UnAuthorized');
            error.statusCode = 401;
            error.result = null;
            throw error;
        };
        const {content, type, skill} = req.body;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error: Error & {statusCode?: any, result?: any} = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        const questionSKill = await Skill.findOne({name: skill});
        const question = new Question({
            interviewerId: interviewer._id.toString(),
            content: content,
            typeQuestion: type,
            skillId: questionSKill?._id.toString()
        });
        await question.save();
        res.status(200).json({success: true, message: 'Create question successfully.', reslult: null});
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null;
        }
        next(err);
    }
};


export const getAllQuestions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.get('Authorization') as string;
        const accessToken = authHeader.split(' ')[1];
        const decodedToken: any = await verifyToken(accessToken);
        const interviewer = await User.findById(decodedToken.userId).populate('roleId');
        if (interviewer?.get('roleId.roleName') !== 'INTERVIEWER') {
            const error: Error & {statusCode?: number, result?: any} = new Error('UnAuthorized');
            error.statusCode = 401;
            error.result = {
                content: []
            };
            throw error;
        };
        const {skill, type} = req.query;
        const page: number = req.query.page ? +req.query.page : 1;
        const limit: number = req.query.limit ? +req.query.limit : 10;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error: Error & {statusCode?: any, result?: any} = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = {
                content: []
            };
            throw error;
        }
        const query: any = {
            interviewerId: interviewer._id.toString()
        }
        if(skill) {
            const skillId = await Skill.findOne({name: skill});
            query['skillId'] = skillId?._id;
        }
        if(type) {
            query['typeQuestion'] = type;
        }
        const questionLength = await Question.find(query).countDocuments();
        if (questionLength === 0) {
            const error: Error & { statusCode?: any, success?: any, result?: any } = new Error('Không tìm thấy câu hỏi');
            error.statusCode = 200;
            error.success = true;
            error.result = {
                content: []
            };
            throw error;
        };
        const listQuestions = await Question.find(query).populate('skillId')
            .skip((page-1)*limit)
            .limit(limit);
        
        const returnListQuestions = listQuestions.map(question => {
            return {
                questionId: question._id.toString(),
                content: question.content,
                typeQuestion: question.typeQuestion,
                skill: question.get('skillId.name')
            }
        })
        res.status(200).json({success: true, message: 'Get list questions successfully.', reslult: {
            pageNumber: page,
            totalPages: Math.ceil(questionLength/limit),
            limit: limit,
            totalElements: questionLength,
            content: returnListQuestions
        }});
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null;
        }
        next(err);
    }
};

export const getSingleQuestion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.get('Authorization') as string;
        const accessToken = authHeader.split(' ')[1];
        const decodedToken: any = await verifyToken(accessToken);
        const interviewer = await User.findById(decodedToken.userId).populate('roleId');
        if (interviewer?.get('roleId.roleName') !== 'INTERVIEWER') {
            const error: Error & {statusCode?: number, result?: any} = new Error('UnAuthorized');
            error.statusCode = 401;
            error.result = null;
            throw error;
        };
        const questionId = req.params.questionId;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error: Error & {statusCode?: any, result?: any} = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        const question = await Question.findById(questionId).populate('skillId')
        if(!question) {
            const error: Error & { statusCode?: any, result?: any } = new Error('Không tìm thấy câu hỏi');
            error.statusCode = 409;
            error.result = null;
            throw error;
        }
        const returnQuestion = {
            questionId: question._id.toString(),
            content: question.content,
            typeQuestion: question.typeQuestion,
            skill: question.get('skillId.name')
        }
        res.status(200).json({success: true, message: 'Get question successfully.', reslult: returnQuestion});
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null;
        }
        next(err);
    }
};

export const updateQuestion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.get('Authorization') as string;
        const accessToken = authHeader.split(' ')[1];
        const decodedToken: any = await verifyToken(accessToken);
        const interviewer = await User.findById(decodedToken.userId).populate('roleId');
        if (interviewer?.get('roleId.roleName') !== 'INTERVIEWER') {
            const error: Error & {statusCode?: number, result?: any} = new Error('UnAuthorized');
            error.statusCode = 401;
            error.result = null;
            throw error;
        };
        const questionId = req.params.questionId;
        const {content, type, skill} = req.body;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error: Error & {statusCode?: any, result?: any} = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        const questionSKill = await Skill.findOne({name: skill});
        const question = await Question.findById(questionId);
        if(!question) {
            const error: Error & { statusCode?: any, result?: any } = new Error('Không tìm thấy câu hỏi');
            error.statusCode = 409;
            error.result = null;
            throw error;
        }
        question.content = content;
        question.typeQuestion = type;
        question.skillId = (questionSKill as any)._id;
        await question.save();
        res.status(200).json({success: true, message: 'Update question successfully.', reslult: null});
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null;
        }
        next(err);
    }
};

export const deleteQuestion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.get('Authorization') as string;
        const accessToken = authHeader.split(' ')[1];
        const decodedToken: any = await verifyToken(accessToken);
        const interviewer = await User.findById(decodedToken.userId).populate('roleId');
        if (interviewer?.get('roleId.roleName') !== 'INTERVIEWER') {
            const error: Error & {statusCode?: number, result?: any} = new Error('UnAuthorized');
            error.statusCode = 401;
            error.result = null;
            throw error;
        };
        const questionId = req.params.questionId;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error: Error & {statusCode?: any, result?: any} = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        const question = await Question.findById(questionId);
        if (!question) {
            const error: Error & { statusCode?: any, result?: any } = new Error('Không tìm thấy câu hỏi');
            error.statusCode = 409;
            error.result = null;
            throw error;
        }
        await Question.findByIdAndDelete(questionId);
        res.status(200).json({success: true, message: 'Delete question successfully.', reslult: null});
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null;
        }
        next(err);
    }
};

