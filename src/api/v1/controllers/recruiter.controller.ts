import { NextFunction, Request, Response } from 'express';
import { secretKey, verifyToken, transporter, formatDateToJSDateObject, addFractionStrings, createICalEvent } from '../utils';
import { validationResult } from 'express-validator';
import { User } from '../models/user';
import { JobPosition } from '../models/jobPosition';
import { Job } from '../models/job';
import { JobType } from '../models/jobType';
import { JobLocation } from '../models/jobLocation';
import { Skill } from '../models/skill';
import { Event } from '../models/event';
import { UploadedFile } from 'express-fileupload';
import { v2 as cloudinary } from 'cloudinary';
import { Role } from '../models/role';
import { JobApply } from '../models/jobApply';
import { Education } from '../models/education';
import { Experience } from '../models/experience';
import { Certificate } from '../models/certificate';
import { Project } from '../models/project';
import { ClientSecretCredential, ClientSecretCredentialOptions } from "@azure/identity";
import * as GraphClient from "@microsoft/microsoft-graph-client";
import { Interview } from '../models/interview';
import { InterviewerInterview } from '../models/interviewerInterview';
import { ResumeUpload } from '../models/resumeUpload';
import { QuestionCandidate } from '../models/questionCandidate';


export const GetAllJobs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.get('Authorization') as string;
        const accessToken = authHeader.split(' ')[1];
        const decodedToken: any = await verifyToken(accessToken);
        const recruiter = await User.findById(decodedToken.userId).populate('roleId');
        if (recruiter?.get('roleId.roleName') !== 'RECRUITER') {
            const error: Error & { statusCode?: number, result?: any } = new Error('UnAuthorized');
            error.statusCode = 401;
            error.result = {
                content: []
            };
            throw error;
        };
        const page: number = req.query.page ? +req.query.page : 1;
        const limit: number = req.query.limit ? +req.query.limit : 10;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error: Error & { statusCode?: any, result?: any } = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = {
                content: []
            };
            throw error;
        }
        const query: any = {
            authorId: recruiter._id,
            isActive: true
        };
        if (req.query['name']) {
            query['name'] = new RegExp((req.query['name'] as any), 'i');
        };
        if (req.query['type']) {
            const jobType = await JobType.findOne({ name: req.query['type'] });
            query['typeId'] = jobType?._id;
        };
        if (req.query['position']) {
            const jobPos = await JobPosition.findOne({ name: req.query['position'] });
            query['positionId'] = jobPos?._id;
        };
        if (req.query['location']) {
            const jobLoc = await JobLocation.findOne({ name: req.query['location'] });
            query['locationId'] = jobLoc?._id;
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

        res.status(200).json({
            success: true, message: 'Get list jobs successfully', statusCode: 200, result: {
                pageNumber: page,
                totalPages: Math.ceil(jobLength / limit),
                limit: limit,
                totalElements: jobLength,
                content: listjobs
            }
        });

    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null;
        }
        next(err);
    }
};

export const CreateJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.get('Authorization') as string;
        const accessToken = authHeader.split(' ')[1];
        const { name, jobType, quantity, benefit, salaryRange,
            requirement, location, description, deadline, position, skillRequired } = req.body;
        const errors = validationResult(req);
        const decodedToken: any = await verifyToken(accessToken);
        const recruiter = await User.findById(decodedToken.userId).populate('roleId');
        if (recruiter?.get('roleId.roleName') !== 'RECRUITER') {
            const error: Error & { statusCode?: number, result?: any } = new Error('UnAuthorized');
            error.statusCode = 401;
            error.result = null;
            throw error;
        };
        if (!errors.isEmpty()) {
            const error: Error & { statusCode?: any, result?: any } = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        const pos = await JobPosition.findOne({ name: position });
        const type = await JobType.findOne({ name: jobType });
        const loc = await JobLocation.findOne({ name: location });

        let listSkill = [];
        for (let skill of skillRequired) {
            const s = await Skill.findOne({ name: skill });
            listSkill.push({ skillId: (s as any)._id });
        };

        const job = new Job({
            name: name,
            positionId: (pos as any)._id.toString(),
            typeId: (type as any)._id.toString(),
            authorId: recruiter._id.toString(),
            quantity: +quantity,
            benefit: benefit,
            salaryRange: salaryRange,
            requirement: requirement,
            locationId: (loc as any)._id.toString(),
            description: description,
            isActive: true,
            deadline: deadline,
            skills: listSkill
        });
        await job.save();
        res.status(200).json({ success: true, message: "Tạo job thành công", result: null })
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null;
        }
        next(err);
    }
};

export const GetSingleJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.get('Authorization') as string;
        const accessToken = authHeader.split(' ')[1];
        const decodedToken: any = await verifyToken(accessToken);
        const recruiter = await User.findById(decodedToken.userId).populate('roleId');
        if (recruiter?.get('roleId.roleName') !== 'RECRUITER') {
            const error: Error & { statusCode?: number, result?: any } = new Error('UnAuthorized');
            error.statusCode = 401;
            error.result = null;
            throw error;
        };
        const jobId = req.params.jobId;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error: Error & { statusCode?: any, result?: any } = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        };
        const job = await Job.findOne({ authorId: recruiter._id, _id: jobId })
            .populate('positionId locationId typeId skills.skillId');
        if (!job) {
            const error: Error & { statusCode?: any, result?: any } = new Error('Không tìm thấy job');
            error.statusCode = 409;
            error.result = null;
            throw error;
        }
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
        res.status(200).json({ sucess: true, message: 'Đã tìm thấy job', result: returnJob });
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null;
        }
        next(err);
    }
};

export const UpdateJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.get('Authorization') as string;
        const accessToken = authHeader.split(' ')[1];
        const jobId = req.params.jobId;
        const { name, jobType, quantity, benefit, salaryRange,
            requirement, location, description, deadline, position, skillRequired } = req.body;
        const errors = validationResult(req);
        const decodedToken: any = await verifyToken(accessToken);
        const recruiter = await User.findById(decodedToken.userId).populate('roleId');
        if (recruiter?.get('roleId.roleName') !== 'RECRUITER') {
            const error: Error & { statusCode?: number, result?: any } = new Error('UnAuthorized');
            error.statusCode = 401;
            error.result = null;
            throw error;
        };
        if (!errors.isEmpty()) {
            const error: Error & { statusCode?: any, result?: any } = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        };
        const pos = await JobPosition.findOne({ name: position });
        const type = await JobType.findOne({ name: jobType });
        const loc = await JobLocation.findOne({ name: location });

        let listSkill = [];
        for (let skill of skillRequired) {
            const s = await Skill.findOne({ name: skill });
            listSkill.push({ skillId: (s as any)._id });
        };

        const job = await Job.findOne({ authorId: recruiter._id, _id: jobId });
        if (!job) {
            const error: Error & { statusCode?: any, result?: any } = new Error('Không tìm thấy job');
            error.statusCode = 409;
            error.result = null;
            throw error;
        };
        job.name = name;
        job.positionId = (pos as any)._id.toString();
        job.typeId = (type as any)._id.toString();
        job.quantity = +quantity;
        job.benefit = benefit;
        job.salaryRange = salaryRange;
        job.requirement = requirement;
        job.locationId = (loc as any)._id.toString();
        job.description = description;
        job.deadline = deadline;
        job.skills = listSkill;
        await job.save();
        res.status(200).json({ sucess: true, message: 'Update job thành công', result: null });
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null;
        }
        next(err);
    }
};

export const DeleteJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.get('Authorization') as string;
        const accessToken = authHeader.split(' ')[1];
        const jobId = req.params.jobId;
        const errors = validationResult(req);
        const decodedToken: any = await verifyToken(accessToken);
        const recruiter = await User.findById(decodedToken.userId).populate('roleId');
        if (!recruiter) {
            const error: Error & { statusCode?: any, result?: any } = new Error('Không tìm thấy user');
            error.statusCode = 409;
            error.result = null;
            throw error;
        };
        if (recruiter.get('roleId.roleName') !== 'RECRUITER') {
            const error: Error & { statusCode?: any, result?: any } = new Error('UnAuthorized');
            error.statusCode = 401;
            error.result = null;
            throw error;
        };
        if (!errors.isEmpty()) {
            const error: Error & { statusCode?: any, result?: any } = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        };
        const job = await Job.findOne({ authorId: recruiter._id, _id: jobId });
        if (!job) {
            const error: Error & { statusCode?: any, result?: any } = new Error('Không tìm thấy job');
            error.statusCode = 409;
            error.result = null;
            throw error;
        }
        await Job.findByIdAndDelete(jobId);
        res.status(200).json({ sucess: true, message: 'Xóa job thành công', result: null });
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null;
        }
        next(err);
    }
};

export const GetAllEvents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.get('Authorization') as string;
        const accessToken = authHeader.split(' ')[1];
        const decodedToken: any = await verifyToken(accessToken);
        const recruiter = await User.findById(decodedToken.userId).populate('roleId');
        if (recruiter?.get('roleId.roleName') !== 'RECRUITER') {
            const error: Error & { statusCode?: any, result?: any } = new Error('UnAuthorized');
            error.statusCode = 401;
            error.result = {
                content: []
            };
            throw error;
        };
        const name = req.query.name;
        const page: number = req.query.page ? +req.query.page : 1;
        const limit: number = req.query.limit ? +req.query.limit : 10;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error: Error & { statusCode?: any, result?: any } = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = {
                content: []
            };
            throw error;
        }
        const query: any = {
            authorId: recruiter._id,
            isActive: true
        };
        if (name) {
            query['name'] = new RegExp((name as any), 'i');
        };

        const eventLenght = await Event.find(query).countDocuments();
        if (eventLenght === 0) {
            const error: Error & { statusCode?: any, success?: any, result?: any } = new Error('Không tìm thấy event');
            error.statusCode = 200;
            error.success = true;
            error.result = {
                content: []
            };
            throw error;
        };

        const events = await Event.find(query).populate('authorId')
            .sort({ updatedAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const listEvents = events.map(e => {
            const { _id, authorId, ...rest } = e;
            delete (rest as any)._doc._id;
            delete (rest as any)._doc.authorId;
            return {
                eventId: _id.toString(),
                author: (authorId as any).fullName,
                ...(rest as any)._doc
            }
        });

        res.status(200).json({
            success: true, message: 'Get list events successfully', statusCode: 200, result: {
                pageNumber: page,
                totalPages: Math.ceil(eventLenght / limit),
                limit: limit,
                totalElements: eventLenght,
                content: listEvents
            }
        });

    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null;
        }
        next(err);
    }
};

export const GetSingleEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.get('Authorization') as string;
        const accessToken = authHeader.split(' ')[1];
        const decodedToken: any = await verifyToken(accessToken);
        const recruiter = await User.findById(decodedToken.userId).populate('roleId');
        if (!recruiter) {
            const error: Error & { statusCode?: any, result?: any } = new Error('Không tìm thấy user');
            error.statusCode = 409;
            error.result = null;
            throw error;
        };

        if (recruiter.get('roleId.roleName') !== 'RECRUITER') {
            const error: Error & { statusCode?: any, result?: any } = new Error('UnAuthorized');
            error.statusCode = 401;
            error.result = null;
            throw error;
        };
        const eventId = req.params.eventId;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error: Error & { statusCode?: any, result?: any } = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        }

        const event = await Event.findById(eventId).populate('authorId');
        if (!event) {
            const error: Error & { statusCode?: any, result?: any } = new Error('Không tìm thấy event');
            error.statusCode = 400;
            error.result = null;
            throw error;
        }

        const { _id, authorId, ...rest } = event;
        delete (rest as any)._doc._id;
        delete (rest as any)._doc.authorId;

        const returnEvent = {
            eventId: _id.toString(),
            author: (authorId as any).fullName,
            ...(rest as any)._doc,
        };

        res.status(200).json({ success: true, message: 'Get event successfully', result: returnEvent });

    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null;
        }
        next(err);
    }
};

export const CreateEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.get('Authorization') as string;
        const accessToken = authHeader.split(' ')[1];
        const decodedToken: any = await verifyToken(accessToken);
        const recruiter = await User.findById(decodedToken.userId).populate('roleId');
        if (!recruiter) {
            const error: Error & { statusCode?: any, result?: any } = new Error('Không tìm thấy user');
            error.statusCode = 409;
            error.result = null;
            throw error;
        };

        if (recruiter.get('roleId.roleName') !== 'RECRUITER') {
            const error: Error & { statusCode?: any, result?: any } = new Error('UnAuthorized');
            error.statusCode = 401;
            error.result = null;
            throw error;
        };
        const { title, name, description, time, location, deadline, startAt } = req.body;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error: Error & { statusCode?: any, result?: any } = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        }

        if (!req.files || !req.files.image) {
            const error: Error & { statusCode?: any, result?: any } = new Error('Không có tệp nào được tải lên!');
            error.statusCode = 400;
            error.result = null;
            throw error;
        };

        const image: UploadedFile = req.files.image as UploadedFile;
        if (image.mimetype !== 'image/jpg' && image.mimetype !== 'image/png' && image.mimetype !== 'image/jpeg') {
            const error: Error & { statusCode?: any, result?: any } = new Error('File ảnh chỉ được phép là jpg,png,jpeg');
            error.statusCode = 400;
            error.result = null;
            throw error;
        };

        const result = await cloudinary.uploader.upload(image.tempFilePath);
        if (!result) {
            const error = new Error('Upload thất bại');
            throw error;
        };

        const publicId = result.public_id;
        const imageUrl = cloudinary.url(publicId);

        const event = new Event({
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
        res.status(200).json({ success: true, message: 'Thêm event thành công', result: null });

    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null;
        }
        next(err);
    }
};

export const UpdateEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.get('Authorization') as string;
        const accessToken = authHeader.split(' ')[1];
        const decodedToken: any = await verifyToken(accessToken);
        const recruiter = await User.findById(decodedToken.userId).populate('roleId');
        if (!recruiter) {
            const error: Error & { statusCode?: any, result?: any } = new Error('Không tìm thấy user');
            error.statusCode = 409;
            error.result = null;
            throw error;
        };

        if (recruiter.get('roleId.roleName') !== 'RECRUITER') {
            const error: Error & { statusCode?: any, result?: any } = new Error('UnAuthorized');
            error.statusCode = 401;
            error.result = null;
            throw error;
        };
        const eventId = req.params.eventId;
        const { title, name, description, time, location, deadline, startAt } = req.body;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error: Error & { statusCode?: any, result?: any } = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        }

        const event = await Event.findById(eventId);
        if (!event) {
            const error: Error & { statusCode?: any, result?: any } = new Error('event không tồn tại');
            error.statusCode = 409;
            error.result = null;
            throw error;
        }

        if (req.files?.image) {
            const image: UploadedFile = req.files.image as UploadedFile;
            if (image.mimetype !== 'image/jpg' && image.mimetype !== 'image/png' && image.mimetype !== 'image/jpeg') {
                const error: Error & { statusCode?: any, result?: any } = new Error('File ảnh chỉ được phép là jpg,png,jpeg');
                error.statusCode = 400;
                error.result = null;
                throw error;
            };
            const result = await cloudinary.uploader.upload(image.tempFilePath);
            if (!result) {
                const error = new Error('Upload thất bại');
                throw error;
            };

            const publicId = result.public_id;
            const imageUrl = cloudinary.url(publicId);

            const deleteEventImage = event.image?.publicId;
            if (deleteEventImage) {
                await cloudinary.uploader.destroy(deleteEventImage);
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
        res.status(200).json({ success: true, message: 'Update event thành công', result: null });

    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null;
        }
        next(err);
    }
};

export const DeleteEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.get('Authorization') as string;
        const accessToken = authHeader.split(' ')[1];
        const decodedToken: any = await verifyToken(accessToken);
        const recruiter = await User.findById(decodedToken.userId).populate('roleId');
        if (!recruiter) {
            const error: Error & { statusCode?: any, result?: any } = new Error('Không tìm thấy user');
            error.statusCode = 409;
            error.result = null;
            throw error;
        };

        if (recruiter.get('roleId.roleName') !== 'RECRUITER') {
            const error: Error & { statusCode?: any, result?: any } = new Error('UnAuthorized');
            error.statusCode = 401;
            error.result = null;
            throw error;
        };
        const eventId = req.params.eventId;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error: Error & { statusCode?: any, result?: any } = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        const event = await Event.findById(eventId);
        if (!event) {
            const error: Error & { statusCode?: any, result?: any } = new Error('event không tồn tại');
            error.statusCode = 409;
            error.result = null;
            throw error;
        }
        const deleteEventImage = event.image?.publicId;
        if (deleteEventImage) {
            await cloudinary.uploader.destroy(deleteEventImage);
        }
        await Event.findByIdAndDelete(eventId);
        res.status(200).json({ success: true, message: 'Xóa event thành công', result: null });

    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null;
        }
        next(err);
    }
};

export const GetAllInterviewers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.get('Authorization') as string;
        const accessToken = authHeader.split(' ')[1];
        const decodedToken: any = await verifyToken(accessToken);
        const recruiter = await User.findById(decodedToken.userId).populate('roleId');
        if (recruiter?.get('roleId.roleName') !== 'RECRUITER') {
            const error: Error & { statusCode?: any, result?: any } = new Error('UnAuthorized');
            error.statusCode = 401;
            error.result = {
                content: []
            };
            throw error;
        };
        const { name, skill } = req.query;
        const page: number = req.query.page ? +req.query.page : 1;
        const limit: number = req.query.limit ? +req.query.limit : 10;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error: Error & { statusCode?: any, result?: any } = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = {
                content: []
            };
            throw error;
        }
        const roleInterviewerId = await Role.findOne({ roleName: "INTERVIEWER" });
        const query: any = {
            roleId: roleInterviewerId?._id.toString()
        };
        if (req.query['name']) {
            query['fullName'] = new RegExp((req.query['name'] as any), 'i');
        };
        if (req.query['skill']) {
            const skillId = await Skill.findOne({ name: req.query['skill'] });
            query['skills.skillId'] = skillId;
        }
        const interviewerLength = await User.find(query).countDocuments();
        const interviewerList = await User.find(query).populate('roleId skills.skillId')
            .sort({ updatedAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);
        const returnInterviewerList = async () => {
            const mappedInterviewers = await Promise.all(
                interviewerList.map(async (interviewer) => {
                    try {
                        const educationList = await Education.find({ candidateId: interviewer._id.toString() });
                        const returnEducationList = educationList.map(e => {
                            return {
                                school: e.school,
                                major: e.major,
                                graduatedYead: e.graduatedYear
                            }

                        })
                        const experienceList = await Experience.find({ candidateId: interviewer._id.toString() });
                        const returnExperienceList = experienceList.map(e => {
                            return {
                                companyName: e.companyName,
                                position: e.position,
                                dateFrom: e.dateFrom,
                                dateTo: e.dateTo
                            }
                        })
                        const certificateList = await Certificate.find({ candidateId: interviewer._id.toString() });
                        const returnCertificateList = certificateList.map(c => {
                            return {
                                name: c.name,
                                receivedDate: c.receivedDate,
                                url: c.url
                            }
                        })
                        const projectList = await Project.find({ candidateId: interviewer._id.toString() });
                        const returnProjectList = projectList.map(p => {
                            return {
                                name: p.name,
                                description: p.description,
                                url: p.url
                            }
                        })
                        let listSkill = [];
                        for (let i = 0; i < interviewer.skills.length; i++) {
                            listSkill.push({ label: (interviewer.skills[i].skillId as any).name, value: i });
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
                            information: {
                                education: returnEducationList,
                                experience: returnExperienceList,
                                certificate: returnCertificateList,
                                project: returnProjectList,
                                skills: listSkill
                            }
                        }
                    } catch (error) {
                        console.error(error);
                        return null;
                    }
                })
            );
            return mappedInterviewers.filter(interviewer => interviewer !== null);
        };
        returnInterviewerList().then(mappedInterviewers => {
            res.status(200).json({
                success: true, message: 'Get list interviewers successfully', result: {
                    pageNumber: page,
                    totalPages: Math.ceil(interviewerLength / limit),
                    limit: limit,
                    totalElements: interviewerLength,
                    content: mappedInterviewers
                }
            });
        });
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null;
        }
        next(err);
    }
};

export const GetSingleInterviewer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.get('Authorization') as string;
        const accessToken = authHeader.split(' ')[1];
        const decodedToken: any = await verifyToken(accessToken);
        const recruiter = await User.findById(decodedToken.userId).populate('roleId');
        if (recruiter?.get('roleId.roleName') !== 'RECRUITER') {
            const error: Error & { statusCode?: any, result?: any } = new Error('UnAuthorized');
            error.statusCode = 401;
            error.result = null;
            throw error;
        };
        const interviewerId = req.params.interviewerId;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error: Error & { statusCode?: any, result?: any } = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        const interviewer = await User.findById(interviewerId).populate('roleId skills.skillId')
        if (!interviewer) {
            const error: Error & { statusCode?: any, result?: any } = new Error('Interviewer không tồn tại');
            error.statusCode = 409;
            error.result = null;
            throw error;
        }
        const educationList = await Education.find({ candidateId: interviewer._id.toString() });
        const returnEducationList = educationList.map(e => {
            return {
                school: e.school,
                major: e.major,
                graduatedYead: e.graduatedYear
            }

        })
        const experienceList = await Experience.find({ candidateId: interviewer._id.toString() });
        const returnExperienceList = experienceList.map(e => {
            return {
                companyName: e.companyName,
                position: e.position,
                dateFrom: e.dateFrom,
                dateTo: e.dateTo
            }
        })
        const certificateList = await Certificate.find({ candidateId: interviewer._id.toString() });
        const returnCertificateList = certificateList.map(c => {
            return {
                name: c.name,
                receivedDate: c.receivedDate,
                url: c.url
            }
        })
        const projectList = await Project.find({ candidateId: interviewer._id.toString() });
        const returnProjectList = projectList.map(p => {
            return {
                name: p.name,
                description: p.description,
                url: p.url
            }
        })
        let listSkill = [];
        for (let i = 0; i < interviewer.skills.length; i++) {
            listSkill.push({ label: (interviewer.skills[i].skillId as any).name, value: i });
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
        }
        res.status(200).json({ success: true, message: 'Get interviewer successfully', result: returnInterviewer });

    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null;
        }
        next(err);
    }
};

export const GetAllApplicants = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.get('Authorization') as string;
        const accessToken = authHeader.split(' ')[1];
        const decodedToken: any = await verifyToken(accessToken);
        const recruiter = await User.findById(decodedToken.userId).populate('roleId');
        if (recruiter?.get('roleId.roleName') !== 'RECRUITER') {
            const error: Error & { statusCode?: any, result?: any } = new Error('UnAuthorized');
            error.statusCode = 401;
            error.result = null;
            throw error;
        };
        const page: number = req.query.page ? +req.query.page : 1;
        const limit: number = req.query.limit ? +req.query.limit : 10;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error: Error & { statusCode?: any, result?: any } = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        const query: any = {}
        if (req.query['name']) {
            query['fullName'] = new RegExp((req.query['name'] as any), 'i');
        };
        if (req.query['skill']) {
            query['skill'] = req.query['skill'];
        }
        const matchName = query['fullName'] ? { fullName: query['fullName'] } : {};
        const matchSkill = query['skill'] ? { name: query['skill'] } : {};

        const ListApplicants = await JobApply.find()
            .populate({
                path: 'jobAppliedId',
                model: Job,
                match: {
                    authorId: recruiter._id.toString()
                },
            })
            .populate({
                path: 'candidateId',
                model: User,
                match: matchName,
                populate: {
                    path: 'skills.skillId',
                    model: Skill,
                    match: matchSkill
                }
            })
            .populate('resumeId')
            .sort({ updatedAt: -1 })

        const returnListApplicants = async () => {
            const mappedApplicants = await Promise.all(
                ListApplicants.map(async (applicant) => {
                    try {
                        const educationList = await Education.find({ candidateId: applicant.candidateId._id.toString() });
                        const returnEducationList = educationList.map(e => {
                            return {
                                school: e.school,
                                major: e.major,
                                graduatedYead: e.graduatedYear
                            }
                        })
                        const experienceList = await Experience.find({ candidateId: applicant.candidateId._id.toString() });
                        const returnExperienceList = experienceList.map(e => {
                            return {
                                companyName: e.companyName,
                                position: e.position,
                                dateFrom: e.dateFrom,
                                dateTo: e.dateTo
                            }
                        })
                        const certificateList = await Certificate.find({ candidateId: applicant.candidateId._id.toString() });
                        const returnCertificateList = certificateList.map(c => {
                            return {
                                name: c.name,
                                receivedDate: c.receivedDate,
                                url: c.url
                            }
                        })
                        const projectList = await Project.find({ candidateId: applicant.candidateId._id.toString() });
                        const returnProjectList = projectList.map(p => {
                            return {
                                name: p.name,
                                description: p.description,
                                url: p.url
                            }
                        })
                        let listSkill = [];
                        for (let i = 0; i < applicant.get('candidateId.skills').length; i++) {
                            listSkill.push({ label: (applicant.get('candidateId.skills')[i].skillId as any).name, value: i });
                        }
                        return {
                            candidateId: applicant.candidateId._id.toString(),
                            blackList: applicant.get('candidateId.blackList'),
                            avatar: applicant.get('candidateId.avatar.url'),
                            candidateFullName: applicant.get('candidateId.fullName'),
                            candidateEmail: applicant.get('candidateId.email'),
                            about: applicant.get('candidateId.about'),
                            dateOfBirth: applicant.get('candidateId.dateOfBirth'),
                            address: applicant.get('candidateId.address'),
                            phone: applicant.get('candidateId.phone'),
                            information: {
                                education: returnEducationList,
                                experience: returnExperienceList,
                                certificate: returnCertificateList,
                                project: returnProjectList,
                                skills: listSkill
                            }
                        }
                    } catch (error) {
                        console.error(error);
                        return null;
                    }

                })
            );
            const getHash = (obj: any): string => JSON.stringify(obj);
            return Array.from(new Set(mappedApplicants.filter(applicant => applicant !== null).map(getHash))).map((hash) => JSON.parse(hash));
        }
        returnListApplicants().then(mappedApplicants => {
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            res.status(200).json({ success: true, message: 'Get list applicants successfully', result: {
                pageNumber: page,
                totalPages: Math.ceil(mappedApplicants.length / limit),
                limit: limit,
                totalElements: mappedApplicants.length,
                content: mappedApplicants.slice(startIndex, endIndex) 
            }});
        })
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null;
        }
        next(err);
    }
};

export const GetSingleApplicants = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.get('Authorization') as string;
        const accessToken = authHeader.split(' ')[1];
        const decodedToken: any = await verifyToken(accessToken);
        const recruiter = await User.findById(decodedToken.userId).populate('roleId');
        if (recruiter?.get('roleId.roleName') !== 'RECRUITER') {
            const error: Error & { statusCode?: any, result?: any } = new Error('UnAuthorized');
            error.statusCode = 401;
            error.result = null;
            throw error;
        };
        const applicantId = req.params.userId;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error: Error & { statusCode?: any, result?: any } = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        const applicant = await User.findById(applicantId).populate('roleId skills.skillId')
        if (!applicant) {
            const error: Error & { statusCode?: any, result?: any } = new Error('Ứng viên không tồn tại');
            error.statusCode = 409;
            error.result = null;
            throw error;
        }
        const educationList = await Education.find({ candidateId: applicant._id.toString() });
        const returnEducationList = educationList.map(e => {
            return {
                school: e.school,
                major: e.major,
                graduatedYead: e.graduatedYear
            }

        })
        const experienceList = await Experience.find({ candidateId: applicant._id.toString() });
        const returnExperienceList = experienceList.map(e => {
            return {
                companyName: e.companyName,
                position: e.position,
                dateFrom: e.dateFrom,
                dateTo: e.dateTo
            }
        })
        const certificateList = await Certificate.find({ candidateId: applicant._id.toString() });
        const returnCertificateList = certificateList.map(c => {
            return {
                name: c.name,
                receivedDate: c.receivedDate,
                url: c.url
            }
        })
        const projectList = await Project.find({ candidateId: applicant._id.toString() });
        const returnProjectList = projectList.map(p => {
            return {
                name: p.name,
                description: p.description,
                url: p.url
            }
        })
        let listSkill = [];
        for (let i = 0; i < applicant.skills.length; i++) {
            listSkill.push({ label: (applicant.skills[i].skillId as any).name, value: i });
        }
        const returnApplicant = {
            candidateId: applicant._id.toString(),
            blackList: applicant.blackList,
            avatar: applicant.get('avatar.url'),
            candidateFullName: applicant.fullName,
            candidateEmail: applicant.email,
            interviewerFullNames: [],
            score: null,
            state: 'NOT_RECEIVED',
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
        }
        res.status(200).json({ success: true, message: 'Get applicant successfully', result: returnApplicant });
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null;
        }
        next(err);
    }
};

export const getApplicantsJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.get('Authorization') as string;
        const accessToken = authHeader.split(' ')[1];
        const decodedToken: any = await verifyToken(accessToken);
        const recruiter = await User.findById(decodedToken.userId).populate('roleId');
        if (recruiter?.get('roleId.roleName') !== 'RECRUITER') {
            const error: Error & { statusCode?: any, result?: any } = new Error('UnAuthorized');
            error.statusCode = 401;
            error.result = null;
            throw error;
        };
        const jobId = req.params.jobId;
        const page: number = req.query.page ? +req.query.page : 1;
        const limit: number = req.query.limit ? +req.query.limit : 10;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error: Error & { statusCode?: any, result?: any } = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = {
                content: []
            };
            throw error;
        }
        const applicantsJobLength = await JobApply.find({ jobAppliedId: jobId }).countDocuments();
        if (applicantsJobLength === 0) {
            const error: Error & { statusCode?: any, result?: any } = new Error('Chưa có ứng viên nào apply vào công việc này');
            error.statusCode = 200;
            error.result = {
                content: []
            };
            throw error;
        }
        const ListApplicantsJob = await JobApply.find({ jobAppliedId: jobId })
            .populate({
                path: 'candidateId',
                model: User,
                populate: {
                    path: 'skills.skillId',
                    model: Skill
                }
            })
            .populate('resumeId')
            .skip((page - 1) * limit)
            .limit(limit);

        const returnListApplicants = async () => {
            const mappedApplicants = await Promise.all(
                ListApplicantsJob.map(async (applicant) => {
                    try {
                        const educationList = await Education.find({ candidateId: applicant.candidateId._id.toString() });
                        const returnEducationList = educationList.map(e => {
                            return {
                                school: e.school,
                                major: e.major,
                                graduatedYead: e.graduatedYear
                            }
                        })
                        const experienceList = await Experience.find({ candidateId: applicant.candidateId._id.toString() });
                        const returnExperienceList = experienceList.map(e => {
                            return {
                                companyName: e.companyName,
                                position: e.position,
                                dateFrom: e.dateFrom,
                                dateTo: e.dateTo
                            }
                        })
                        const certificateList = await Certificate.find({ candidateId: applicant.candidateId._id.toString() });
                        const returnCertificateList = certificateList.map(c => {
                            return {
                                name: c.name,
                                receivedDate: c.receivedDate,
                                url: c.url
                            }
                        })
                        const projectList = await Project.find({ candidateId: applicant.candidateId._id.toString() });
                        const returnProjectList = projectList.map(p => {
                            return {
                                name: p.name,
                                description: p.description,
                                url: p.url
                            }
                        })
                        let listSkill = [];
                        for (let i = 0; i < applicant.get('candidateId.skills').length; i++) {
                            listSkill.push({ label: (applicant.get('candidateId.skills')[i].skillId as any).name, value: i });
                        }
                        const interview = await Interview.findOne({ jobApplyId: applicant.jobAppliedId._id.toString(), candidateId: applicant.candidateId._id.toString() });
                        const interviewers = await InterviewerInterview.findOne({ interviewId: interview?._id.toString() }).populate('interviewersId');
                        const interviewerFullNames = interviewers?.interviewersId.map(interviewer => {
                            return (interviewer as any).fullName;
                        })
                        const scoreInterviewer = await QuestionCandidate.find({ interviewId: interview?._id.toString() });
                        const score = scoreInterviewer.reduce((totalScore, scoreInterviewer) => {
                            return addFractionStrings(totalScore, scoreInterviewer.totalScore as string);
                        }, "0/0")
                        const [numerator, denominator] = score.split('/').map(Number);
                        let totalScore;
                        if (denominator === 0) {
                            totalScore = null;
                        } else {
                            totalScore = `${numerator * 100 / denominator}/100`;
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
                        }
                    } catch (error) {
                        console.error(error);
                        return null;
                    }

                })
            );
            return mappedApplicants.filter(applicant => applicant !== null);
        }
        returnListApplicants().then(mappedApplicants => {
            res.status(200).json({
                success: true, message: 'Get list applicants successfully', result: {
                    pageNumber: page,
                    totalPages: Math.ceil(applicantsJobLength / limit),
                    limit: limit,
                    totalElements: applicantsJobLength,
                    content: mappedApplicants
                }
            });
        });
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null;
        }
        next(err);
    }
};

export const getSingleApplicantsJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.get('Authorization') as string;
        const accessToken = authHeader.split(' ')[1];
        const decodedToken: any = await verifyToken(accessToken);
        const recruiter = await User.findById(decodedToken.userId).populate('roleId');
        if (recruiter?.get('roleId.roleName') !== 'RECRUITER') {
            const error: Error & { statusCode?: any, result?: any } = new Error('UnAuthorized');
            error.statusCode = 401;
            error.result = null;
            throw error;
        };
        const { jobId, candidateId } = req.params;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error: Error & { statusCode?: any, result?: any } = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = {
                content: []
            };
            throw error;
        }
        const applicant = await JobApply.findOne({ jobAppliedId: jobId, candidateId: candidateId })
            .populate({
                path: 'candidateId',
                model: User,
                populate: {
                    path: 'skills.skillId',
                    model: Skill
                }
            })
            .populate('resumeId');
        if (!applicant) {
            const error: Error & { statusCode?: any, result?: any } = new Error('Không thể tìm thấy ứng viên');
            error.statusCode = 409;
            error.result = null;
            throw error;
        }
        const educationList = await Education.find({ candidateId: applicant.candidateId._id.toString() });
        const returnEducationList = educationList.map(e => {
            return {
                school: e.school,
                major: e.major,
                graduatedYead: e.graduatedYear
            }
        })
        const experienceList = await Experience.find({ candidateId: applicant.candidateId._id.toString() });
        const returnExperienceList = experienceList.map(e => {
            return {
                companyName: e.companyName,
                position: e.position,
                dateFrom: e.dateFrom,
                dateTo: e.dateTo
            }
        })
        const certificateList = await Certificate.find({ candidateId: applicant.candidateId._id.toString() });
        const returnCertificateList = certificateList.map(c => {
            return {
                name: c.name,
                receivedDate: c.receivedDate,
                url: c.url
            }
        })
        const projectList = await Project.find({ candidateId: applicant.candidateId._id.toString() });
        const returnProjectList = projectList.map(p => {
            return {
                name: p.name,
                description: p.description,
                url: p.url
            }
        })
        let listSkill = [];
        for (let i = 0; i < applicant.get('candidateId.skills').length; i++) {
            listSkill.push({ label: (applicant.get('candidateId.skills')[i].skillId as any).name, value: i });
        }
        const interview = await Interview.findOne({ jobApplyId: jobId, candidateId: candidateId });
        const interviewers = await InterviewerInterview.findOne({ interviewId: interview?._id.toString() }).populate('interviewersId');
        const interviewerFullNames = interviewers?.interviewersId.map(interviewer => {
            return (interviewer as any).fullName;
        })
        const scoreInterviewer = await QuestionCandidate.find({ interviewId: interview?._id.toString() });
        const score = scoreInterviewer.reduce((totalScore, scoreInterviewer) => {
            return addFractionStrings(totalScore, scoreInterviewer.totalScore as string);
        }, "0/0")
        const [numerator, denominator] = score.split('/').map(Number);
        let totalScore;
        if (denominator === 0) {
            totalScore = null;
        } else {
            totalScore = `${numerator * 100 / denominator}/100`;
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
        }
        res.status(200).json({ success: true, message: 'Get applicant successfully', result: returnApplicant });
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null;
        }
        next(err);
    }
};

export const createMeeting = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.get('Authorization') as string;
        const accessToken = authHeader.split(' ')[1];
        const decodedToken: any = await verifyToken(accessToken);
        const recruiter = await User.findById(decodedToken.userId).populate('roleId');
        if (recruiter?.get('roleId.roleName') !== 'RECRUITER') {
            const error: Error & { statusCode?: any, result?: any } = new Error('UnAuthorized');
            error.statusCode = 401;
            error.result = null;
            throw error;
        };
        const { candidateId, interviewersId, time, jobApplyId } = req.body;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error: Error & { statusCode?: any, result?: any } = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = {
                content: []
            };
            throw error;
        }
        const candidate = await User.findById(candidateId);
        if (!candidate) {
            const error: Error & { statusCode?: any, result?: any } = new Error('Không tìm thấy candidate');
            error.statusCode = 409;
            error.result = null;
            throw error;
        }
        const jobId = await Job.findById(jobApplyId);
        if (!jobId) {
            const error: Error & { statusCode?: any, result?: any } = new Error('Không tìm thấy Job');
            error.statusCode = 409;
            error.result = null;
            throw error;
        }
        const jobApply = await JobApply.findOne({ candidateId: candidateId, jobAppliedId: jobApplyId }).populate('resumeId');
        if (!jobApply) {
            const error: Error & { statusCode?: any, result?: any } = new Error('Không tìm thấy Job Apply');
            error.statusCode = 409;
            error.result = null;
            throw error;
        }

        const clientId = 'ef86ecc5-3294-4b4d-986e-d0377dc29b20';
        const tenantId = '1f74f109-07f6-4291-81bc-64bc4acbd48a';
        const clientSecret = `${process.env.CLIENT_SECRET}`;
        const scopes = ["https://graph.microsoft.com/.default"];
        const credentialOptions: ClientSecretCredentialOptions = {
            authorityHost: "https://login.microsoftonline.com",
        };
        const credential = new ClientSecretCredential(tenantId, clientId, clientSecret, credentialOptions);
        const graphClient = GraphClient.Client.init({
            authProvider: (done) => {
                credential
                    .getToken(scopes)
                    .then((tokenResponse) => {
                        const token = tokenResponse?.token;
                        if (token) {
                            done(null, token);
                        } else {
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
        const interview = new Interview({
            candidateId: candidateId,
            jobApplyId: jobApplyId,
            time: startDateTime.toISOString(),
            interviewLink: meetingUrl,
            state: 'PENDING'
        })
        await interview.save();
        const interviewerInterview = new InterviewerInterview({
            interviewersId: interviewersId,
            interviewId: interview._id.toString()
        })
        await interviewerInterview.save();
        jobApply.status = "REVIEWING";
        await jobApply.save();

        let interviewersMail = [];
        let interviewersName = [] as string[];
        for (let i = 0; i < interviewersId.length; i++) {
            const interviewer = await User.findById(interviewersId[i].toString());
            if (!interviewer) {
                const error: Error & { statusCode?: any, result?: any } = new Error('Không tìm thấy interviewer');
                error.statusCode = 409;
                error.result = null;
                throw error;
            }
            interviewersMail.push(interviewer.email);
            interviewersName.push(interviewer.fullName as string);
        }
        let attendees = interviewersMail.concat(candidate.email) as string[];
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
                    <p>The interview time is on ${formatDateToJSDateObject(startDateTime)}.</p>
                    <p>If you have any questions, please don't hesitate to contact us.</p>
                    <p>Regard, ${recruiter.fullName}.</p>
                    <p><b>Start Date:</b> ${formatDateToJSDateObject(startDateTime)}</p>
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
                        <button style="background-color: #008000; padding: 10px 50px; border-radius: 5px; border-style: none;"><a href="${meetingUrl
                }" style="font-size: 15px;color: white; text-decoration: none">Join Now</a></button>
                    </div>
                    <p><b>Description:</b> Job: N&T</p>
                    <p><b>Link applicant CV:</b> <a href="${jobApply.get('resumeId.resumeUpload')}">Download CV</a></p>
                </div>
            </div>
            `,
            attachments: [
                {
                    filename: 'invitation.ics',
                    content: createICalEvent(startDateTime, endDateTime, attendees),
                    encoding: 'base64'
                }
            ]
        };
        transporter.sendMail(mailDetails, err => {
            const error: Error = new Error('Gửi mail thất bại');
            throw error;
        });
        res.status(200).json({ success: true, message: 'Create meeting successfully', result: null });
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null;
        }
        next(err);
    }
};

export const updateCandidateState = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.get('Authorization') as string;
        const accessToken = authHeader.split(' ')[1];
        const decodedToken: any = await verifyToken(accessToken);
        const recruiter = await User.findById(decodedToken.userId).populate('roleId');
        if (recruiter?.get('roleId.roleName') !== 'RECRUITER') {
            const error: Error & { statusCode?: any, result?: any } = new Error('UnAuthorized');
            error.statusCode = 401;
            error.result = null;
            throw error;
        };
        const { candidateId, jobId, state } = req.body;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error: Error & { statusCode?: any, result?: any } = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        const jobApply = await JobApply.findOne({ candidateId: candidateId, jobAppliedId: jobId });
        if (!jobApply) {
            const error: Error & { statusCode?: any, result?: any } = new Error('Không tìm thấy job apply');
            error.statusCode = 409;
            error.result = null;
            throw error;
        }
        jobApply.status = state;
        await jobApply.save()
        res.status(200).json({ success: true, message: 'Update state successfully', result: null });
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null;
        }
        next(err);
    }
};


export const GetJobSuggestedCandidates = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.get('Authorization') as string;
        const accessToken = authHeader.split(' ')[1];
        const decodedToken: any = await verifyToken(accessToken);
        const recruiter = await User.findById(decodedToken.userId).populate('roleId');
        if (recruiter?.get('roleId.roleName') !== 'RECRUITER') {
            const error: Error & { statusCode?: any, result?: any } = new Error('UnAuthorized');
            error.statusCode = 401;
            error.result = null;
            throw error;
        };
        const jobId = req.params.jobId;
        const page: number = req.query.page ? +req.query.page : 1;
        const limit: number = req.query.limit ? +req.query.limit : 10;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error: Error & { statusCode?: any, result?: any } = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        const suggestedCandidateLength = await JobApply.find({ jobAppliedId: jobId, status: "PASS" }).countDocuments();
        if (suggestedCandidateLength === 0) {
            const error: Error & { statusCode?: any, result?: any } = new Error('Chưa có ứng viên nào PASS công việc này');
            error.statusCode = 200;
            error.result = {
                content: []
            };
            throw error;
        }
        const suggestedCandidates = await JobApply.find({ jobAppliedId: jobId, status: "PASS" })
            .populate({
                path: 'candidateId',
                model: User,
                populate: {
                    path: 'skills.skillId',
                    model: Skill
                }
            })
            .populate('resumeId')
            .skip((page - 1) * limit)
            .limit(limit);

        const returnListApplicants = async () => {
            const mappedApplicants = await Promise.all(
                suggestedCandidates.map(async (applicant) => {
                    try {
                        const educationList = await Education.find({ candidateId: applicant.candidateId._id.toString() });
                        const returnEducationList = educationList.map(e => {
                            return {
                                school: e.school,
                                major: e.major,
                                graduatedYead: e.graduatedYear
                            }
                        })
                        const experienceList = await Experience.find({ candidateId: applicant.candidateId._id.toString() });
                        const returnExperienceList = experienceList.map(e => {
                            return {
                                companyName: e.companyName,
                                position: e.position,
                                dateFrom: e.dateFrom,
                                dateTo: e.dateTo
                            }
                        })
                        const certificateList = await Certificate.find({ candidateId: applicant.candidateId._id.toString() });
                        const returnCertificateList = certificateList.map(c => {
                            return {
                                name: c.name,
                                receivedDate: c.receivedDate,
                                url: c.url
                            }
                        })
                        const projectList = await Project.find({ candidateId: applicant.candidateId._id.toString() });
                        const returnProjectList = projectList.map(p => {
                            return {
                                name: p.name,
                                description: p.description,
                                url: p.url
                            }
                        })
                        let listSkill = [];
                        for (let i = 0; i < applicant.get('candidateId.skills').length; i++) {
                            listSkill.push({ label: (applicant.get('candidateId.skills')[i].skillId as any).name, value: i });
                        }
                        const interview = await Interview.findOne({ jobApplyId: applicant.jobAppliedId._id.toString(), candidateId: applicant.candidateId._id.toString() });
                        const interviewers = await InterviewerInterview.findOne({ interviewId: interview?._id.toString() }).populate('interviewersId');
                        const interviewerFullNames = interviewers?.interviewersId.map(interviewer => {
                            return (interviewer as any).fullName;
                        })
                        const scoreInterviewer = await QuestionCandidate.find({ interviewId: interview?._id.toString() });
                        const score = scoreInterviewer.reduce((totalScore, scoreInterviewer) => {
                            return addFractionStrings(totalScore, scoreInterviewer.totalScore as string);
                        }, "0/0")
                        const [numerator, denominator] = score.split('/').map(Number);
                        let totalScore;
                        if (denominator === 0) {
                            totalScore = null;
                        } else {
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
                        }
                    } catch (error) {
                        console.error(error);
                        return null;
                    }

                })
            );
            return mappedApplicants.filter(applicant => applicant !== null);
        }
        returnListApplicants().then(mappedApplicants => {
            res.status(200).json({
                success: true, message: 'Get list applicants successfully', result: {
                    pageNumber: page,
                    totalPages: Math.ceil(suggestedCandidateLength / limit),
                    limit: limit,
                    totalElements: suggestedCandidateLength,
                    content: mappedApplicants
                }
            });
        });
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null;
        }
        next(err);
    }
};