import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { User } from '../models/user';
import { verifyToken, isPDF, ApplyStatus } from '../utils';
import {v2 as cloudinary} from 'cloudinary';
import { UploadedFile } from 'express-fileupload';
import { ResumeUpload } from '../models/resumeUpload';
import { JobApply } from '../models/jobApply';
import { Job } from '../models/job';
import { Education } from '../models/education';
import { Experience } from '../models/experience';
import { Certificate } from '../models/certificate';
import { Project } from '../models/project';
import { Skill } from '../models/skill';


export const GetResumes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.get('Authorization') as string;
    const accessToken = authHeader.split(' ')[1];

    try {
        const decodedToken: any = await verifyToken(accessToken);
        const candidate = await User.findById(decodedToken.userId).populate('roleId');
        if (candidate?.get('roleId.roleName') !== 'CANDIDATE') {
            const error: Error & {statusCode?: number, result?: any} = new Error('UnAuthorized');
            error.statusCode = 401;
            error.result = null;
            throw error;
        };
        const resumesLength = await ResumeUpload.find({candidateId: candidate._id}).countDocuments();
        const resumes = await ResumeUpload.find({candidateId: candidate.id});
        const listResumes = resumes.map(resume => {
            return {
                resumeId: resume._id.toString(),
                name: resume.name,
                resumeUpload: resume.resumeUpload,
                createdDay: resume.createdAt
            };
        })
        res.status(200).json({success: true, message: 'Lấy list resumes thành công',result: {content: listResumes,resumesLength: resumesLength}, statusCode: 200});
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null;
        }
        next(err);
    };
};

export const UploadResume = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.get('Authorization') as string;
    const accessToken = authHeader.split(' ')[1];

    try {
        const decodedToken: any = await verifyToken(accessToken);
        const candidate = await User.findById(decodedToken.userId).populate('roleId');
        if (candidate?.get('roleId.roleName') !== 'CANDIDATE') {
            const error: Error & {statusCode?: number, result?: any} = new Error('UnAuthorized');
            error.statusCode = 401;
            error.result = null;
            throw error;
        };

        if (!req.files || !req.files.resumeFile) {
            const error: Error & {statusCode?: number, result?: any} = new Error('Không có tệp nào được tải lên!');
            error.statusCode = 400;
            error.result = null;
            throw error;
        };

        const resume: UploadedFile = req.files.resumeFile as UploadedFile;
        if (!isPDF(resume)) {
            const error: Error & {statusCode?: number, result?: any} = new Error('Resume chỉ cho phép file pdf');
            error.statusCode = 400;
            error.result = null;
            throw error;
        };
        
        const result = await cloudinary.uploader.upload(resume.tempFilePath);
        if (!result) {
            const error = new Error('Upload thất bại');
            throw error;
        };

        const publicId = result.public_id;
        const resumeUrl = cloudinary.url(publicId);

        const cv = new ResumeUpload({
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
        
        res.status(200).json({success: true, message: 'Upload resume thành công',result: cvInfo, statusCode: 200});
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null;
        };
        next(err);
    };
};

export const DeleteResume = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.get('Authorization') as string;
    const accessToken = authHeader.split(' ')[1];
    const errors = validationResult(req);
    try {
        const decodedToken: any = await verifyToken(accessToken);
        const candidate = await User.findById(decodedToken.userId).populate('roleId');
        if (candidate?.get('roleId.roleName') !== 'CANDIDATE') {
            const error: Error & {statusCode?: number, result?: any} = new Error('UnAuthorized');
            error.statusCode = 401;
            error.result = null;
            throw error;
        };

        if(!errors.isEmpty()) {
            const error: Error & {statusCode?: number, result?: any} = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        };
        const resumeId = req.params.resumeId;
        const resume = await ResumeUpload.findById(resumeId);
        if(!resume) {
            const error: Error & {statusCode?: number, result?: any} = new Error('Không tìm thấy resume');
            error.statusCode = 409;
            error.result = null;
            throw error;
        };
        const publicId = resume.publicId;
        const isDelete = await ResumeUpload.findOneAndDelete({_id: resumeId});
        if (!isDelete) {
            const error: Error = new Error('Xóa resume thất bại');
            throw error;
        };
        await cloudinary.uploader.destroy(publicId);
        res.status(200).json({success: true, message: 'Xóa resume thành công', statusCode: 200});
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null;
        }
        next(err);
    };
};

export const CheckApply = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.get('Authorization') as string;
    const accessToken = authHeader.split(' ')[1];
    try {
        const decodedToken: any = await verifyToken(accessToken);
        const candidate = await User.findById(decodedToken.userId).populate('roleId');
        if (candidate?.get('roleId.roleName') !== 'CANDIDATE') {
            const error: Error & {statusCode?: number, result?: any} = new Error('UnAuthorized');
            error.statusCode = 401;
            error.result = null;
            throw error;
        };
        const jobId = req.params.jobId;
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            const error: Error & {statusCode?: number, result?: any} = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        };
        const jobApply = await JobApply.findOne({jobAppliedId: jobId, candidateId: candidate._id.toString()});
        if(!jobApply) {
            res.status(200).json({success: true, message: 'Bạn chưa apply vào công việc này', result: null});
        }
        res.status(200).json({success: true, message: 'Bạn đã apply vào công việc này', result: {
            jobAppliedId: jobId,
            status: jobApply?.status
        }});
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null;
        }
        next(err);
    }
}

export const ApplyJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.get('Authorization') as string;
    const accessToken = authHeader.split(' ')[1];
    try {
        const decodedToken: any = await verifyToken(accessToken);
        const candidate = await User.findById(decodedToken.userId).populate('roleId');
        if (candidate?.get('roleId.roleName') !== 'CANDIDATE') {
            const error: Error & {statusCode?: number, result?: any} = new Error('UnAuthorized');
            error.statusCode = 401;
            error.result = null;
            throw error;
        };
        const jobId = req.params.jobId;
        const resumeId = req.body.resumeId;
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            const error: Error & {statusCode?: number, result?: any} = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        };
        const isExist = ResumeUpload.findById(resumeId);
        if (!isExist) {
            const error: Error & {statusCode?: number, result?: any} = new Error('Resume không tồn tại');
            error.statusCode = 409;
            error.result = null;
            throw error;
        }
        const jobApply = new JobApply({
            jobAppliedId: jobId.toString(),
            candidateId: candidate._id.toString(),
            resumeId: resumeId,
            status: ApplyStatus[0]
        })
        await jobApply.save();
        const job = await Job.findById(jobId);
        res.status(200).json({success: true, message: 'Apply thành công', result: {
            jobAppliedId: jobApply.jobAppliedId,
            status: jobApply.status,
            appliedDate: jobApply.createdAt,
            jobName: job?.name
        }})
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null;
        }
        next(err);
    }
};

export const GetAppliedJobs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.get('Authorization') as string;
    const accessToken = authHeader.split(' ')[1];
    try {
        const decodedToken: any = await verifyToken(accessToken);
        const candidate = await User.findById(decodedToken.userId).populate('roleId');
        if (candidate?.get('roleId.roleName') !== 'CANDIDATE') {
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
        const appliedJobsLength = await JobApply.find({candidateId: candidate._id.toString()}).countDocuments();
        if (appliedJobsLength === 0) {
            const error: Error & { statusCode?: any, success?: any, result?: any } = new Error('Bạn chưa apply công việc nào');
            error.statusCode = 200;
            error.success = true;
            error.result = {
                content: []
            };
            throw error;
        };
        const appliedJobs = await JobApply.find({candidateId: candidate._id.toString()}).populate('jobAppliedId')
            .skip((page - 1) * limit)
            .limit(limit);

        const retunAppliedJobs = appliedJobs.map(job => {
            return {
                jobAppliedId: job.jobAppliedId._id.toString(),
                status: job.status,
                AppliedDate: job.createdAt,
                jobName: job.get('jobAppliedId.name')
            }
        })
        res.status(200).json({success: true, message: 'Lấy danh sách thành công', result: {
            pageNumber: page,
            totalPages: Math.ceil(appliedJobsLength/limit),
            limit: limit,
            totalElements: appliedJobsLength,
            content: retunAppliedJobs
        }})
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null;
        }
        next(err);
    }
};

export const GetInformation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.get('Authorization') as string;
    const accessToken = authHeader.split(' ')[1];
    try {
        const decodedToken: any = await verifyToken(accessToken);
        const candidate = await User.findById(decodedToken.userId).populate('roleId');
        if (candidate?.get('roleId.roleName') !== 'CANDIDATE') {
            const error: Error & {statusCode?: number, result?: any} = new Error('UnAuthorized');
            error.statusCode = 401;
            error.result = {
                content: []
            };
            throw error;
        };
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null;
        }
        next(err);
    }
};

export const saveInformation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.get('Authorization') as string;
    const accessToken = authHeader.split(' ')[1];
    try {
        const decodedToken: any = await verifyToken(accessToken);
        const candidate = await User.findById(decodedToken.userId).populate('roleId');
        if (candidate?.get('roleId.roleName') !== 'CANDIDATE') {
            const error: Error & {statusCode?: number, result?: any} = new Error('UnAuthorized');
            error.statusCode = 401;
            error.result = {
                content: []
            };
            throw error;
        };
        const {education, experience, certificate, project, skills} = req.body;
        if (education.length !== 0) {
            for (let i=0; i<education.length; i++) {
                let e = new Education({
                    candidateId: candidate._id.toString(),
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
                    candidateId: candidate._id.toString(),
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
                    candidateId: candidate._id.toString(),
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
                    candidateId: candidate._id.toString(),
                    name: project[i].name,
                    description: project[i].description,
                    url: project[i].url,
                })
                await p.save();
            }
        }
        if (skills.length !== 0) {
            for (let i=0; i<skills.length; i++) {
                console.log("Skill: "+skills[i].label);
                let skill = await Skill.findOne({name: skills[i].label});
                candidate.skills.push((skill as any)._id);
            }
            await candidate.save();
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
    const authHeader = req.get('Authorization') as string;
    const accessToken = authHeader.split(' ')[1];
    try {
        const decodedToken: any = await verifyToken(accessToken);
        const candidate = await User.findById(decodedToken.userId).populate('roleId');
        if (candidate?.get('roleId.roleName') !== 'CANDIDATE') {
            const error: Error & {statusCode?: number, result?: any} = new Error('UnAuthorized');
            error.statusCode = 401;
            error.result = {
                content: []
            };
            throw error;
        };
        const educationList = await Education.find({candidateId: candidate._id.toString()});
        const returnEducationList = educationList.map(e => {
            return {
                school: e.school,
                major: e.major,
                graduatedYead: e.graduatedYear
            }
            
        })
        const experienceList = await Experience.find({candidateId: candidate._id.toString()});
        const returnExperienceList = experienceList.map(e => {
            return {
                companyName: e.companyName,
                position: e.position,
                dateFrom: e.dateFrom,
                dateTo: e.dateTo
            }
        })
        const certificateList = await Certificate.find({candidateId: candidate._id.toString()});
        const returnCertificateList = certificateList.map(c => {
            return {
                name: c.name,
                receivedDate: c.receivedDate,
                url: c.url
            }
        })
        const projectList = await Project.find({candidateId: candidate._id.toString()});
        const returnProjectList = projectList.map(p => {
            return {
                name: p.name,
                description: p.description,
                url: p.url
            }
        })
        let skills = [];
        for (let i=0; i<candidate.skills.length; i++) {
            let skill = await Skill.findById(candidate.skills[i]);
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

