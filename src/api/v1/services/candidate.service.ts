import { UploadedFile } from "express-fileupload";
import { ResumeUpload } from "../models/resumeUpload";
import { User } from "../models/user";
import { v2 as cloudinary } from 'cloudinary';
import { JobApply } from "../models/jobApply";
import { applyStatus } from "../utils";
import { Job } from "../models/job";
import { Education } from "../models/education";
import { Experience } from "../models/experience";
import { Certificate } from "../models/certificate";
import { Project } from "../models/project";
import { InterviewerInterview } from "../models/interviewerInterview";
import mongoose from "mongoose";
import { Interview } from "../models/interview";
import createHttpError from "http-errors";
import { FavoriteJob } from "../models/favoritejob";

export const candidateService = {
    getResumes: async (candidateId: string) => {
        const candidate = await User.findById(candidateId).populate('roleId');
        if (candidate?.get('roleId.roleName') !== 'CANDIDATE') {
            const error: Error & { statusCode?: number, result?: any } = new Error('UnAuthorized');
            error.statusCode = 401;
            error.result = null;
            throw error;
        };
        const resumeLength = await ResumeUpload.find({ candidateId: candidate._id }).countDocuments();
        const resumes = await ResumeUpload.find({ candidateId: candidate.id }).sort({ updatedAt: -1 });
        const listResumes = resumes.map(resume => {
            return {
                resumeId: resume._id.toString(),
                name: resume.name,
                resumeUpload: resume.resumeUpload,
                createdDay: resume.createdAt
            };
        })
        return { listResumes, resumeLength };
    },
    uploadResume: async (candidateId: string, resume: UploadedFile) => {
        const candidate = await User.findById(candidateId).populate('roleId');
        if (candidate?.get('roleId.roleName') !== 'CANDIDATE') {
            const error: Error & { statusCode?: number, result?: any } = new Error('UnAuthorized');
            error.statusCode = 401;
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
        return cvInfo;
    },
    deleteResume: async (candidateId: string, resumeId: string) => {
        const candidate = await User.findById(candidateId).populate('roleId');
        if (candidate?.get('roleId.roleName') !== 'CANDIDATE') {
            const error: Error & { statusCode?: number, result?: any } = new Error('UnAuthorized');
            error.statusCode = 401;
            error.result = null;
            throw error;
        };
        const resume = await ResumeUpload.findById(resumeId);
        if (!resume) {
            const error: Error & { statusCode?: number, result?: any } = new Error('Không tìm thấy resume');
            error.statusCode = 409;
            error.result = null;
            throw error;
        };
        const publicId = resume.publicId;
        const isDelete = await ResumeUpload.findOneAndDelete({ _id: resumeId });
        if (!isDelete) {
            const error: Error = new Error('Xóa resume thất bại');
            throw error;
        };
        await cloudinary.uploader.destroy(publicId);
    },
    checkApply: async (candidateId: string, jobId: string) => {
        const candidate = await User.findById(candidateId).populate('roleId');
        if (candidate?.get('roleId.roleName') !== 'CANDIDATE') {
            const error: Error & { statusCode?: number, result?: any } = new Error('UnAuthorized');
            error.statusCode = 401;
            error.result = null;
            throw error;
        };
        const jobApply = await JobApply.findOne({ jobAppliedId: jobId, candidateId: candidate._id.toString() });
        let message, result;
        if (!jobApply) {
            message = 'Bạn chưa apply vào công việc này';
            result = null;
        } else {
            message = 'Bạn đã apply vào công việc này';
            result = {
                jobAppliedId: jobId,
                status: jobApply?.status
            }
        }
        return { message, result }
    },
    applyJob: async (candidateId: string, jobId: string, resumeId: string) => {
        const candidate = await User.findById(candidateId).populate('roleId');
        if (candidate?.get('roleId.roleName') !== 'CANDIDATE') {
            const error: Error & { statusCode?: number, result?: any } = new Error('UnAuthorized');
            error.statusCode = 401;
            error.result = null;
            throw error;
        };
        const isExist = ResumeUpload.findById(resumeId);
        if (!isExist) {
            const error: Error & { statusCode?: number, result?: any } = new Error('Resume không tồn tại');
            error.statusCode = 409;
            error.result = null;
            throw error;
        }
        const jobApplied = await JobApply.findOne({ candidateId: candidate._id.toString(), jobAppliedId: jobId });
        if (jobApplied) {
            const error: Error & { statusCode?: number, result?: any } = new Error('Bạn đã apply vào job này');
            error.statusCode = 409;
            error.result = null;
            throw error;
        }
        const jobApply = new JobApply({
            jobAppliedId: jobId.toString(),
            candidateId: candidate._id.toString(),
            resumeId: resumeId,
            status: applyStatus[0]
        })
        await jobApply.save();
        const job = await Job.findById(jobId);
        const result = {
            jobAppliedId: jobApply.jobAppliedId,
            status: jobApply.status,
            appliedDate: jobApply.createdAt,
            jobName: job?.name
        }
        return { result }
    },
    getAppliedJobs: async (candidateId: string, page: number, limit: number) => {
        const candidate = await User.findById(candidateId).populate('roleId');
        if (candidate?.get('roleId.roleName') !== 'CANDIDATE') {
            const error: Error & { statusCode?: number, result?: any } = new Error('UnAuthorized');
            error.statusCode = 401;
            error.result = {
                content: []
            };
            throw error;
        };
        const appliedJobsLength = await JobApply.find({ candidateId: candidate._id.toString() }).countDocuments();
        if (appliedJobsLength === 0) {
            const error: Error & { statusCode?: any, success?: any, result?: any } = new Error('Bạn chưa apply công việc nào');
            error.statusCode = 200;
            error.success = true;
            error.result = {
                content: []
            };
            throw error;
        };
        const appliedJobs = await JobApply.find({ candidateId: candidate._id.toString() }).populate('jobAppliedId')
            .sort({ updatedAt: -1 })
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
        return { retunAppliedJobs, appliedJobsLength };
    },
    saveInformation: async (candidateId: string, education: any, experience: any, certificate: any, project: any, skills: any) => {
        const candidate = await User.findById(candidateId).populate('roleId');
        if (candidate?.get('roleId.roleName') !== 'CANDIDATE') {
            const error: Error & { statusCode?: number, result?: any } = new Error('UnAuthorized');
            error.statusCode = 401;
            error.result = {
                content: []
            };
            throw error;
        };
        await Education.deleteMany({ candidateId: candidate._id.toString() });
        await Experience.deleteMany({ candidateId: candidate._id.toString() });
        await Certificate.deleteMany({ candidateId: candidate._id.toString() });
        await Project.deleteMany({ candidateId: candidate._id.toString() });
        candidate.skills = [];
        await candidate.save();
        if (education.length !== 0) {
            for (let i = 0; i < education.length; i++) {
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
            for (let i = 0; i < experience.length; i++) {
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
            for (let i = 0; i < certificate.length; i++) {
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
            for (let i = 0; i < project.length; i++) {
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
            candidate.skills = skills;
            await candidate.save();
        }
    },
    getInformation: async (candidateId: string) => {
        const candidate = await User.findById(candidateId).populate('roleId');
        if (candidate?.get('roleId.roleName') !== 'CANDIDATE') {
            const error: Error & { statusCode?: number, result?: any } = new Error('UnAuthorized');
            error.statusCode = 401;
            error.result = {
                content: []
            };
            throw error;
        };
        const educationList = await Education.find({ candidateId: candidate._id.toString() });
        const returnEducationList = educationList.map(e => {
            return {
                school: e.school,
                major: e.major,
                graduatedYead: e.graduatedYear
            }

        })
        const experienceList = await Experience.find({ candidateId: candidate._id.toString() });
        const returnExperienceList = experienceList.map(e => {
            return {
                companyName: e.companyName,
                position: e.position,
                dateFrom: e.dateFrom,
                dateTo: e.dateTo
            }
        })
        const certificateList = await Certificate.find({ candidateId: candidate._id.toString() });
        const returnCertificateList = certificateList.map(c => {
            return {
                name: c.name,
                receivedDate: c.receivedDate,
                url: c.url
            }
        })
        const projectList = await Project.find({ candidateId: candidate._id.toString() });
        const returnProjectList = projectList.map(p => {
            return {
                name: p.name,
                description: p.description,
                url: p.url
            }
        })
        return {
            education: returnEducationList,
            experience: returnExperienceList,
            certificate: returnCertificateList,
            project: returnProjectList,
            skills: candidate.skills
        }
    },
    getAllInterviews: async (candidateId: string, page: number, limit: number) => {
        const candidate = await User.findById(candidateId).populate('roleId');
        if (candidate?.get('roleId.roleName') !== 'CANDIDATE') {
            const error: Error & { statusCode?: number, result?: any } = new Error('UnAuthorized');
            error.statusCode = 401;
            error.result = {
                content: []
            };
            throw error;
        };
        const interviewLength = await InterviewerInterview.aggregate([
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
                    "interviews.candidateId": new mongoose.Types.ObjectId(candidate._id.toString())
                }
            }
        ]);
        if (interviewLength.length === 0) {
            const error: Error & { statusCode?: any, success?: any, result?: any } = new Error('Bạn chưa có buổi phỏng vấn nào');
            error.statusCode = 200;
            error.success = true;
            error.result = {
                content: []
            };
            throw error;
        }
        const listInterviews = await InterviewerInterview.aggregate([
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
                    "interviews.candidateId": new mongoose.Types.ObjectId(candidate._id.toString())
                }
            }
        ]).sort({ updatedAt: -1 }).skip((page - 1) * limit).limit(limit);

        const populateInterviewers = await InterviewerInterview.populate(listInterviews, {
            path: 'interviewersId',
            model: User
        })
        const populateInterviews = await InterviewerInterview.populate(populateInterviewers, {
            path: 'interviewId',
            model: Interview,
            populate: {
                path: 'jobApplyId',
                model: Job,
            }
        })
        const returnListInterview = populateInterviews.map(interview => {
            let interviewersName = [];
            for (let interviewer of interview.interviewersId) {
                interviewersName.push((interviewer as any).fullName)
            }
            return {
                jobName: (interview.interviewId as any).jobApplyId.name,
                time: (interview.interviewId as any).time,
                interviewersName: interviewersName,
                interviewLink: (interview.interviewId as any).interviewLink
            }
        })
        return { returnListInterview, interviewLength };
    },
    addFavoriteJob: async (candidateId: string, jobId: string) => {
        const candidate = await User.findById(candidateId).populate('roleId');
        if (!candidate) {
            throw createHttpError.NotFound('User not existed!');
        }
        if (candidate?.get('roleId.roleName') !== 'CANDIDATE') {
            throw createHttpError.Unauthorized();
        }
        const job = await Job.findById(jobId);
        if (!job) {
            throw createHttpError.NotFound('Job not existed!');
        }
        const favoriteJob = await FavoriteJob.findOne({ userId: candidateId });
        if (!favoriteJob) {
            const favoriteJobs = new FavoriteJob({
                userId: candidateId,
                favoriteJobs: [jobId]
            })
            await favoriteJobs.save();
        } else {
            const jobExist = favoriteJob.favoriteJobs.includes(jobId);
            if (jobExist) {
                throw createHttpError.BadRequest('This job was added to favorite job!');
            }
            favoriteJob.favoriteJobs.push(jobId);
            await favoriteJob.save();
        }
    },
    getFavoriteJob: async (candidateId: string) => {
        return await (FavoriteJob as any).getFavoriteJob(candidateId);
    }
}
