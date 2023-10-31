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


export const GetAllJobs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.get('Authorization') as string;
    const accessToken = authHeader.split(' ')[1];

    try {
        const decodedToken: any = await verifyToken(accessToken);
        const recruiter = await User.findById(decodedToken.userId).populate('roleId');
        if (!recruiter) {
            const error: Error & {statusCode?: number, result?: any} = new Error('Không tìm thấy user');
            error.statusCode = 409;
            error.result = {
                content: []
            };
            throw error;
        };
        
        if (recruiter.get('roleId.roleName') !== 'RECRUITER') {
            const error: Error & {statusCode?: number, result?: any} = new Error('UnAuthorized');
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
            const error: Error & {statusCode?: any, result?: any} = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = {
                content: []
            };
            throw error;
        }
        const query: any = {
            authorId: recruiter._id
        };
        if (req.query['name']) {
            query['name'] = req.query['name'];
        };
        if (req.query['type']) {
            const jobType = await JobType.findOne({name: req.query['type']});
            query['typeId'] = jobType?._id;
        };
        if (req.query['position']) {
            const jobPos = await JobPosition.findOne({name: req.query['position']});
            query['positionId'] = jobPos?._id;
        };
        if (req.query['location']) {
            const jobLoc = await JobLocation.findOne({name: req.query['location']});
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
            .skip((page - 1) * limit)
            .limit(limit);
        
        const listjobs = jobs.map(job => {
            const { _id, skills, positionId, locationId, typeId, ...rest} = job;
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

        res.status(200).json({success: true, message: 'Successfully', statusCode: 200, result: {
            pageNumber: page,
            totalPages: Math.ceil(jobLength/limit),
            limit: limit,
            totalElements: jobLength,
            content: listjobs
        }});

    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null;
        }
        next(err);
    }
};

export const CreateJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.get('Authorization') as string;
    const accessToken = authHeader.split(' ')[1];
    const { name, jobType, quantity, benefit, salaryRange, 
        requirement, location, description, deadline, position, skillRequired } = req.body;
    const errors = validationResult(req);
    try {
        const decodedToken: any = await verifyToken(accessToken);
        const recruiter = await User.findById(decodedToken.userId).populate('roleId');
        if (!recruiter) {
            const error: Error & {statusCode?: number, result?: any} = new Error('Không tìm thấy user');
            error.statusCode = 409;
            error.result = null;
            throw error;
        };
        if (recruiter.get('roleId.roleName') !== 'RECRUITER') {
            const error: Error & {statusCode?: number, result?: any} = new Error('UnAuthorized');
            error.statusCode = 401;
            error.result = null;
            throw error;
        };
        if(!errors.isEmpty()) {
            const error: Error & { statusCode?: any, result?: any } = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        const pos = await JobPosition.findOne({name: position});
        const type = await JobType.findOne({name: jobType}); 
        const loc = await JobLocation.findOne({name: location});
        
        let listSkill = [];
        for (let skill of skillRequired) {
            const s = await Skill.findOne({name: skill});
            listSkill.push({skillId: (s as any)._id});
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
        res.status(200).json({success: true, message: "Tạo job thành công", result: null})
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null;
        }
        next(err);
    }
};

export const GetSingleJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.get('Authorization') as string;
    const accessToken = authHeader.split(' ')[1];
    const jobId = req.params.jobId;
    const errors = validationResult(req);
    try {
        const decodedToken: any = await verifyToken(accessToken);
        const recruiter = await User.findById(decodedToken.userId).populate('roleId');
        if (!recruiter) {
            const error: Error & {statusCode?: number, result?: any} = new Error('Không tìm thấy user');
            error.statusCode = 409;
            error.result = null;
            throw error;
        };
        if (recruiter.get('roleId.roleName') !== 'RECRUITER') {
            const error: Error & {statusCode?: number, result?: any} = new Error('UnAuthorized');
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
        const job = await Job.findOne({authorId: recruiter._id, _id: jobId}).populate('positionId locationId typeId skills.skillId');
        if (!job) {
            const error: Error & { statusCode?: any, result?: any } = new Error('Không tìm thấy job');
            error.statusCode = 409;
            error.result = null;
            throw error;
        }
        const { _id, skills, positionId, locationId, typeId, ...rest} = job;
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
        res.status(200).json({sucess: true, message: 'Đã tìm thấy job', result: returnJob});
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null;
        }
        next(err);
    }
};

export const UpdateJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.get('Authorization') as string;
    const accessToken = authHeader.split(' ')[1];
    const jobId = req.params.jobId;
    const { name, jobType, quantity, benefit, salaryRange, 
        requirement, location, description, deadline, position, skillRequired } = req.body;
    const errors = validationResult(req);
    try {
        const decodedToken: any = await verifyToken(accessToken);
        const recruiter = await User.findById(decodedToken.userId).populate('roleId');
        if (!recruiter) {
            const error: Error & {statusCode?: number, result?: any} = new Error('Không tìm thấy user');
            error.statusCode = 409;
            error.result = null;
            throw error;
        };
        if (recruiter.get('roleId.roleName') !== 'RECRUITER') {
            const error: Error & {statusCode?: number, result?: any} = new Error('UnAuthorized');
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
        const pos = await JobPosition.findOne({name: position});
        const type = await JobType.findOne({name: jobType}); 
        const loc = await JobLocation.findOne({name: location});

        let listSkill = [];
        for (let skill of skillRequired) {
            const s = await Skill.findOne({name: skill});
            listSkill.push({skillId: (s as any)._id});
        };

        const job = await Job.findOne({authorId: recruiter._id, _id: jobId});
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
        res.status(200).json({sucess: true, message: 'Update job thành công', result: null});
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null;
        }
        next(err);
    }
};

export const DeleteJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.get('Authorization') as string;
    const accessToken = authHeader.split(' ')[1];
    const jobId = req.params.jobId;
    const errors = validationResult(req);
    try {
        const decodedToken: any = await verifyToken(accessToken);
        const recruiter = await User.findById(decodedToken.userId).populate('roleId');
        if (!recruiter) {
            const error: Error & {statusCode?: any, result?: any} = new Error('Không tìm thấy user');
            error.statusCode = 409;
            error.result = null;
            throw error;
        };
        if (recruiter.get('roleId.roleName') !== 'RECRUITER') {
            const error: Error & {statusCode?: any, result?: any} = new Error('UnAuthorized');
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
        const job = await Job.findOne({authorId: recruiter._id, _id: jobId});
        if (!job) {
            const error: Error & { statusCode?: any, result?: any } = new Error('Không tìm thấy job');
            error.statusCode = 409;
            error.result = null;
            throw error;
        }
        await Job.findByIdAndDelete(jobId);
        res.status(200).json({sucess: true, message: 'Xóa job thành công', result: null});
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null;
        }
        next(err);
    }
};

export const GetAllEvents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.get('Authorization') as string;
    const accessToken = authHeader.split(' ')[1];

    try {
        const decodedToken: any = await verifyToken(accessToken);
        const recruiter = await User.findById(decodedToken.userId).populate('roleId');
        if (!recruiter) {
            const error: Error & {statusCode?: any, result?: any} = new Error('Không tìm thấy user');
            error.statusCode = 409;
            error.result = {
                content: []
            };
            throw error;
        };
        
        if (recruiter.get('roleId.roleName') !== 'RECRUITER') {
            const error: Error & {statusCode?: any, result?: any} = new Error('UnAuthorized');
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
            const error: Error & {statusCode?: any, result?: any} = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = {
                content: []
            };
            throw error;
        }
        const query: any = {
            authorId: recruiter._id
        };
        if (name) {
            query['name'] = name;
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
            .skip((page - 1) * limit)
            .limit(limit);

        const listEvents = events.map(e => {
            const {_id, authorId, ...rest} = e;
            delete (rest as any)._doc._id;
            delete (rest as any)._doc.authorId;
            return {
                eventId: _id.toString(),
                author: (authorId as any).fullName,
                ...(rest as any)._doc
            }
        });

        res.status(200).json({success: true, message: 'Successfully', statusCode: 200, result: {
            pageNumber: page,
            totalPages: Math.ceil(eventLenght/limit),
            limit: limit,
            totalElements: eventLenght,
            content: listEvents
        }});

    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null;
        }
        next(err);
    }
};

export const GetSingleEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.get('Authorization') as string;
    const accessToken = authHeader.split(' ')[1];

    try {
        const decodedToken: any = await verifyToken(accessToken);
        const recruiter = await User.findById(decodedToken.userId).populate('roleId');
        if (!recruiter) {
            const error: Error & {statusCode?: any, result?: any} = new Error('Không tìm thấy user');
            error.statusCode = 409;
            error.result = null;
            throw error;
        };
        
        if (recruiter.get('roleId.roleName') !== 'RECRUITER') {
            const error: Error & {statusCode?: any, result?: any} = new Error('UnAuthorized');
            error.statusCode = 401;
            error.result = null;
            throw error;
        };
        const eventId = req.params.eventId;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error: Error & {statusCode?: any, result?: any} = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        
        const event = await Event.findById(eventId).populate('authorId');
        if (!event) {
            const error: Error & {statusCode?: any, result?: any} = new Error('Không tìm thấy event');
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
           
        const {_id, authorId, ...rest} = event;
        delete (rest as any)._doc._id;
        delete (rest as any)._doc.authorId;
        
        const returnEvent = {
            eventId: _id.toString(),
            author: (authorId as any).fullName,
            ...(rest as any)._doc,
        };

        res.status(200).json({success: true, message: 'Successfully', result: returnEvent});

    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null;
        }
        next(err);
    }
};

export const CreateEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.get('Authorization') as string;
    const accessToken = authHeader.split(' ')[1];

    try {
        const decodedToken: any = await verifyToken(accessToken);
        const recruiter = await User.findById(decodedToken.userId).populate('roleId');
        if (!recruiter) {
            const error: Error & {statusCode?: any, result?: any} = new Error('Không tìm thấy user');
            error.statusCode = 409;
            error.result = null;
            throw error;
        };
        
        if (recruiter.get('roleId.roleName') !== 'RECRUITER') {
            const error: Error & {statusCode?: any, result?: any} = new Error('UnAuthorized');
            error.statusCode = 401;
            error.result = null;
            throw error;
        };
        const {title, name, description, time, location, deadline, startAt} = req.body;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error: Error & {statusCode?: any, result?: any} = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        
        if (!req.files || !req.files.image) {
            const error: Error & {statusCode?: any, result?: any} = new Error('Không có tệp nào được tải lên!');
            error.statusCode = 400;
            error.result = null;
            throw error;
        };

        const image: UploadedFile = req.files.image as UploadedFile;
        if (image.mimetype !== 'image/jpg' && image.mimetype !== 'image/png' && image.mimetype !== 'image/jpeg') {
            const error: Error & {statusCode?: any, result?: any} = new Error('File ảnh chỉ được phép là jpg,png,jpeg');
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
        res.status(200).json({success: true, message: 'Thêm event thành công', result: null});

    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null;
        }
        next(err);
    }
};

export const UpdateEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.get('Authorization') as string;
    const accessToken = authHeader.split(' ')[1];

    try {
        const decodedToken: any = await verifyToken(accessToken);
        const recruiter = await User.findById(decodedToken.userId).populate('roleId');
        if (!recruiter) {
            const error: Error & {statusCode?: any, result?: any} = new Error('Không tìm thấy user');
            error.statusCode = 409;
            error.result = null;
            throw error;
        };
        
        if (recruiter.get('roleId.roleName') !== 'RECRUITER') {
            const error: Error & {statusCode?: any, result?: any} = new Error('UnAuthorized');
            error.statusCode = 401;
            error.result = null;
            throw error;
        };
        const eventId = req.params.eventId;
        const {title, name, description, time, location, deadline, startAt} = req.body;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error: Error & {statusCode?: any, result?: any} = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        }

        const event = await Event.findById(eventId);
        if(!event) {
            const error: Error & {statusCode?: any, result?: any} = new Error('event không tồn tại');
            error.statusCode = 409;
            error.result = null;
            throw error;
        }
        
        if (req.files?.image) {
            const image: UploadedFile = req.files.image as UploadedFile;
            if (image.mimetype !== 'image/jpg' && image.mimetype !== 'image/png' && image.mimetype !== 'image/jpeg') {
                const error: Error & {statusCode?: any, result?: any} = new Error('File ảnh chỉ được phép là jpg,png,jpeg');
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
            if(deleteEventImage) {
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
        res.status(200).json({success: true, message: 'Update event thành công', result: null});

    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null;
        }
        next(err);
    }
};

export const DeleteEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.get('Authorization') as string;
    const accessToken = authHeader.split(' ')[1];

    try {
        const decodedToken: any = await verifyToken(accessToken);
        const recruiter = await User.findById(decodedToken.userId).populate('roleId');
        if (!recruiter) {
            const error: Error & {statusCode?: any, result?: any} = new Error('Không tìm thấy user');
            error.statusCode = 409;
            error.result = null;
            throw error;
        };
        
        if (recruiter.get('roleId.roleName') !== 'RECRUITER') {
            const error: Error & {statusCode?: any, result?: any} = new Error('UnAuthorized');
            error.statusCode = 401;
            error.result = null;
            throw error;
        };
        const eventId = req.params.eventId;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error: Error & {statusCode?: any, result?: any} = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        const event = await Event.findById(eventId);
        if(!event) {
            const error: Error & {statusCode?: any, result?: any} = new Error('event không tồn tại');
            error.statusCode = 409;
            error.result = null;
            throw error;
        }
        const deleteEventImage = event.image?.publicId;
        if(deleteEventImage) {
            await cloudinary.uploader.destroy(deleteEventImage);
        }
        await Event.findByIdAndDelete(eventId);
        res.status(200).json({success: true, message: 'Xóa event thành công', result: null});

    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null;
        }
        next(err);
    }
};