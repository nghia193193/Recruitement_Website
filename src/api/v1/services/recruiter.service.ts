import { v2 as cloudinary } from 'cloudinary';
import { Event } from "../models/event";
import { Interview } from "../models/interview";
import { Job } from "../models/job";
import { JobApply } from "../models/jobApply";
import { JobLocation } from "../models/jobLocation";
import { JobPosition } from "../models/jobPosition";
import { JobType } from "../models/jobType";
import { Skill } from "../models/skill";
import { User } from "../models/user";
import { UploadedFile } from 'express-fileupload';
import { Role } from '../models/role';
import { Education } from '../models/education';
import { Experience } from '../models/experience';
import { Project } from '../models/project';
import { Certificate } from '../models/certificate';
import mongoose from 'mongoose';
import { InterviewerInterview } from '../models/interviewerInterview';
import { QuestionCandidate } from '../models/questionCandidate';
import { addFractionStrings, createICalEvent, formatDateToJSDateObject, transporter } from '../utils';
import { ClientSecretCredential, ClientSecretCredentialOptions } from '@azure/identity';
import * as GraphClient from "@microsoft/microsoft-graph-client";


export const getAllJobs = async (recruiterId: string, name: any, type: any, position: any,
    location: any, active: any, page: number, limit: number) => {
    const recruiter = await User.findById(recruiterId).populate('roleId');
    if (!recruiter) {
        const error: Error & { statusCode?: any, result?: any } = new Error('Không tìm thấy user');
        error.statusCode = 409;
        error.result = null;
        throw error;
    };
    if (recruiter.get('roleId.roleName') !== 'RECRUITER') {
        const error: Error & { statusCode?: number, result?: any } = new Error('UnAuthorized');
        error.statusCode = 401;
        error.result = {
            content: []
        };
        throw error;
    };
    const query: any = {
        authorId: recruiterId,
    };
    switch (active) {
        case undefined: 
            query['isActive'] = true;
            query['deadline'] = { $gt: new Date()};
            break;
        case 'false':  
            query['$or'] = [
                { deadline: { $lt: new Date() } },
                { isActive: false }
            ]
            break;
        case 'true':
            query['isActive'] = true;
            query['deadline'] = { $gt: new Date()};
    }
    if (name) {
        query['name'] = new RegExp((name as any), 'i');
    };
    if (type) {
        const jobType = await JobType.findOne({ name: type });
        query['typeId'] = jobType?._id;
    };
    if (position) {
        const jobPos = await JobPosition.findOne({ name: position });
        query['positionId'] = jobPos?._id;
    };
    if (location) {
        const jobLoc = await JobLocation.findOne({ name: location });
        query['locationId'] = jobLoc?._id;
    };
    console.log(query)
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
    return { listjobs, jobLength };
}

export const createJob = async (recruiterId: string, name: string, position: string, jobType: string, quantity: string,
    benefit: string, salaryRange: string, requirement: string, location: string, description: string, deadline: Date, skillRequired: any) => {
    const recruiter = await User.findById(recruiterId).populate('roleId');
    if (!recruiter) {
        const error: Error & { statusCode?: any, result?: any } = new Error('Không tìm thấy user');
        error.statusCode = 409;
        error.result = null;
        throw error;
    };
    if (recruiter.get('roleId.roleName') !== 'RECRUITER') {
        const error: Error & { statusCode?: number, result?: any } = new Error('UnAuthorized');
        error.statusCode = 401;
        error.result = null;
        throw error;
    };
    const existJob = await Job.findOne({ name: name });
    if (existJob) {
        const error: Error & { statusCode?: any, result?: any } = new Error('Tên job này đã tồn tại vui lòng nhập tên khác');
        error.statusCode = 409;
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
}

export const getSingleJob = async (recruiterId: string, jobId: string) => {
    const recruiter = await User.findById(recruiterId).populate('roleId');
    if (!recruiter) {
        const error: Error & { statusCode?: any, result?: any } = new Error('Không tìm thấy user');
        error.statusCode = 409;
        error.result = null;
        throw error;
    };
    if (recruiter.get('roleId.roleName') !== 'RECRUITER') {
        const error: Error & { statusCode?: number, result?: any } = new Error('UnAuthorized');
        error.statusCode = 401;
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
    return returnJob;
}

export const updateJob = async (recruiterId: string, jobId: string, name: string, position: string, jobType: string,
    quantity: string, benefit: string, salaryRange: string, requirement: string, location: string,
    description: string, deadline: Date, skillRequired: any) => {
    const recruiter = await User.findById(recruiterId).populate('roleId');
    if (!recruiter) {
        const error: Error & { statusCode?: any, result?: any } = new Error('Không tìm thấy user');
        error.statusCode = 409;
        error.result = null;
        throw error;
    };
    if (recruiter.get('roleId.roleName') !== 'RECRUITER') {
        const error: Error & { statusCode?: number, result?: any } = new Error('UnAuthorized');
        error.statusCode = 401;
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
}

export const deleteJob = async (recruiterId: string, jobId: string) => {
    const recruiter = await User.findById(recruiterId).populate('roleId');
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
    const job = await Job.findOne({ authorId: recruiter._id, _id: jobId });
    if (!job) {
        const error: Error & { statusCode?: any, result?: any } = new Error('Không tìm thấy job');
        error.statusCode = 409;
        error.result = null;
        throw error;
    }
    await Job.findByIdAndDelete(jobId);
}

export const getAllEvents = async (recruiterId: string, query: any, page: number, limit: number) => {
    const recruiter = await User.findById(recruiterId).populate('roleId');
    if (!recruiter) {
        const error: Error & { statusCode?: any, result?: any } = new Error('Không tìm thấy user');
        error.statusCode = 409;
        error.result = null;
        throw error;
    };
    if (recruiter.get('roleId.roleName') !== 'RECRUITER') {
        const error: Error & { statusCode?: any, result?: any } = new Error('UnAuthorized');
        error.statusCode = 401;
        error.result = {
            content: []
        };
        throw error;
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
    return { listEvents, eventLenght };
}

export const getSingleEvent = async (recruiterId: string, eventId: string) => {
    const recruiter = await User.findById(recruiterId).populate('roleId');
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
    return returnEvent;
}

export const createEvent = async (recruiterId: string, image: UploadedFile, title: string, name: string,
    description: string, time: string, location: string, deadline: any, startAt: any) => {
    const recruiter = await User.findById(recruiterId).populate('roleId');
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
    const isExist = await Event.findOne({ name: name });
    if (isExist) {
        const error: Error & { statusCode?: any, result?: any } = new Error('Tên event này đã được tạo vui lòng chọn tên khác.');
        error.statusCode = 409;
        error.result = null;
        throw error;
    }
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
}

export const updateEvent = async (recruiterId: string, eventId: string, image: any, title: string, name: string,
    description: string, time: string, location: string, deadline: any, startAt: any) => {
    const recruiter = await User.findById(recruiterId).populate('roleId');
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
    const event = await Event.findById(eventId);
    if (!event) {
        const error: Error & { statusCode?: any, result?: any } = new Error('event không tồn tại');
        error.statusCode = 409;
        error.result = null;
        throw error;
    }

    if (image) {
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
}

export const deleteEvent = async (recruiterId: string, eventId: string) => {
    const recruiter = await User.findById(recruiterId).populate('roleId');
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
}

export const getAllInterviewers = async (recruiterId: string, name: any, skill: any, page: number, limit: number) => {
    const recruiter = await User.findById(recruiterId).populate('roleId');
    if (!recruiter) {
        const error: Error & { statusCode?: any, result?: any } = new Error('Không tìm thấy user');
        error.statusCode = 409;
        error.result = null;
        throw error;
    };
    if (recruiter.get('roleId.roleName') !== 'RECRUITER') {
        const error: Error & { statusCode?: any, result?: any } = new Error('UnAuthorized');
        error.statusCode = 401;
        error.result = {
            content: []
        };
        throw error;
    };
    const roleInterviewerId = await Role.findOne({ roleName: "INTERVIEWER" });
    const query: any = {
        roleId: roleInterviewerId?._id.toString()
    };
    if (name) {
        query['fullName'] = new RegExp((name as any), 'i');
    };
    if (skill) {
        const skillId = await Skill.findOne({ name: skill });
        query['skills.skillId'] = skillId;
    }
    const interviewerLength = await User.find(query).countDocuments();
    const interviewerList = await User.find(query).populate('roleId skills.skillId')
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

    const mappedInterviewers = interviewerList.map(interviewer => {
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
            skills: listSkill
        }
    })
    return { mappedInterviewers, interviewerLength };
}

export const getSingleInterviewer = async (recruiterId: string, interviewerId: string) => {
    const recruiter = await User.findById(recruiterId).populate('roleId');
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
    return returnInterviewer;
}

export const getAllApplicants = async (recruiterId: string, name: any, skill: any, page: number, limit: number) => {
    const recruiter = await User.findById(recruiterId).populate('roleId');
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
    const listApplicants = await JobApply.aggregate([
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
                "jobs.authorId": new mongoose.Types.ObjectId(recruiter._id.toString()),
                "applicants.fullName": name ? new RegExp((name as any), 'i') : { $exists: true },
                "skills.name": skill ? skill : { $exists: true },
            }
        }
    ]).sort({ updatedAt: -1 })
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
        }
    })

    const getHash = (obj: any): string => JSON.stringify(obj);
    const returnApplicants = Array.from(new Set(mappedApplicants.map(getHash))).map((hash) => JSON.parse(hash));
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const applicantLength = returnApplicants.length;
    const applicantList = returnApplicants.slice(startIndex, endIndex);
    return { applicantList, applicantLength };
}

export const getSingleApplicant = async (recruiterId: string, applicantId: string) => {
    const recruiter = await User.findById(recruiterId).populate('roleId');
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
    return returnApplicant;
}

export const getApplicantsJob = async (recruiterId: string, jobId: string, page: number, limit: number) => {
    const recruiter = await User.findById(recruiterId).populate('roleId');
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
                    let totalScore;
                    if (scoreInterviewer) {
                        totalScore = "0/0";
                        for (let i = 0; i < scoreInterviewer.length; i++) {
                            if (!scoreInterviewer[i].totalScore) {
                                totalScore = null;
                                break;
                            }
                            totalScore = addFractionStrings(totalScore, scoreInterviewer[i].totalScore as string);
                        }
                        if (totalScore) {
                            const [numerator, denominator] = totalScore.split('/').map(Number);
                            if (denominator === 0) {
                                totalScore = null;
                            } else {
                                totalScore = `${(numerator * 100 / denominator).toFixed(0)}/100`;
                            }
                        }
                    } else {
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
                    }
                } catch (error) {
                    console.error(error);
                    return null;
                }

            })
        );
        return mappedApplicants.filter(applicant => applicant !== null);
    }
    const applicantList = await returnListApplicants().then(mappedApplicants => {
        return mappedApplicants
    });
    return { applicantList, applicantsJobLength };
}

export const getSingleApplicantJob = async (recruiterId: string, jobId: string, candidateId: string) => {
    const recruiter = await User.findById(recruiterId).populate('roleId');
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
    let totalScore;
    if (scoreInterviewer) {
        totalScore = "0/0";
        for (let i = 0; i < scoreInterviewer.length; i++) {
            if (!scoreInterviewer[i].totalScore) {
                totalScore = null;
                break;
            }
            totalScore = addFractionStrings(totalScore, scoreInterviewer[i].totalScore as string);
        }
        if (totalScore) {
            const [numerator, denominator] = totalScore.split('/').map(Number);
            if (denominator === 0) {
                totalScore = null;
            } else {
                totalScore = `${(numerator * 100 / denominator).toFixed(0)}/100`;
            }
        }
    } else {
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
    }
    return returnApplicant;
}

export const createMeeting = async (recruiterId: string, candidateId: string, interviewersId: any, time: any, jobApplyId: string) => {
    const recruiter = await User.findById(recruiterId).populate('roleId');
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
        state: 'PENDING',
        authorId: recruiter._id.toString()
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

}

export const updateCandidateState = async (recruiterId: string, candidateId: string, jobId: string, state: string) => {
    const recruiter = await User.findById(recruiterId).populate('roleId');
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
    const jobApply = await JobApply.findOne({ candidateId: candidateId, jobAppliedId: jobId });
    if (!jobApply) {
        const error: Error & { statusCode?: any, result?: any } = new Error('Không tìm thấy job apply');
        error.statusCode = 409;
        error.result = null;
        throw error;
    }
    jobApply.status = state;
    jobApply.authorId = recruiter._id;
    await jobApply.save()
}

export const getJobSuggestedCandidates = async (recruiterId: string, jobId: string, page: number, limit: number) => {
    const recruiter = await User.findById(recruiterId).populate('roleId');
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
    const sugggestedCandidateList = await returnListApplicants().then(mappedApplicants => {
        return mappedApplicants;
    });
    return { sugggestedCandidateList, suggestedCandidateLength };
}

export const getInterviewsOfCandidate = async (recruiterId: string, candidateId: string, page: number, limit: number) => {
    const recruiter = await User.findById(recruiterId).populate('roleId');
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
    const interviews = await InterviewerInterview.aggregate([
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
                "interviews.candidateId": new mongoose.Types.ObjectId(candidateId),
                "jobs.authorId": new mongoose.Types.ObjectId(recruiter._id.toString())
            }
        },

    ]).sort({ updatedAt: -1 })
    if (interviews.length === 0) {
        const error: Error & { statusCode?: any, result?: any } = new Error('Bạn chưa có buổi phỏng vấn nào.');
        error.statusCode = 200;
        error.result = {
            content: []
        };
        throw error;
    }
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const returnInterviews = interviews.map(interview => {
        const interviewersFullName: any = interview.interviewers.map((interviewer: any) => {
            return interviewer.fullName
        })
        return {
            interviewId: interview.interviews[0]._id.toString(),
            jobName: interview.jobs[0].name,
            interviewLink: interview.interviews[0].interviewLink,
            time: interview.interviews[0].time,
            position: interview.jobpositions[0].name,
            state: interview.interviews[0].state,
            interviewersFullName: interviewersFullName
        }
    })
    const interviewLength = interviews.length;
    const interviewList = returnInterviews.slice(startIndex, endIndex);
    return { interviewList, interviewLength };
}

export const getInterviewsOfInterviewer = async (recruiterId: string, interviewerId: string, page: number, limit: number) => {
    const recruiter = await User.findById(recruiterId).populate('roleId');
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
    const listInterviews = await InterviewerInterview.aggregate([
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
                "interviewers._id": new mongoose.Types.ObjectId(interviewerId),
                "jobs.authorId": new mongoose.Types.ObjectId(recruiter._id.toString()),
            }
        }
    ])
        .sort({ updatedAt: -1 })
    if (listInterviews.length === 0) {
        const error: Error & { statusCode?: any, result?: any } = new Error('Bạn chưa có buổi phỏng vấn nào.');
        error.statusCode = 200;
        error.result = {
            content: []
        };
        throw error;
    }
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const returnListInterviews = listInterviews.map(interview => {
        const listInterviewers = interview.interviewers.map((interviewer: any) => {
            return interviewer.fullName;
        })
        return {
            interviewId: interview.interviews[0]._id.toString(),
            jobName: interview.jobs[0].name,
            interviewLink: interview.interviews[0].interviewLink,
            time: interview.interviews[0].time,
            position: interview.jobpositions[0].name,
            state: interview.interviews[0].state,
            interviewersFullName: listInterviewers
        }
    })
    const interviewLength = listInterviews.length;
    const interviewList = returnListInterviews.slice(startIndex, endIndex);
    return { interviewList, interviewLength };
}

export const recruiterStatistics = async (recruiterId: string) => {
    const recruiter = await User.findById(recruiterId).populate('roleId');
    if (!recruiter) {
        const error: Error & { statusCode?: any, result?: any } = new Error('Không tìm thấy user');
        error.statusCode = 409;
        error.result = null;
        throw error;
    };
    if (recruiter.get('roleId.roleName') !== 'RECRUITER') {
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