"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplyJob = exports.CheckApply = exports.DeleteResume = exports.UploadResume = exports.GetResumes = void 0;
const express_validator_1 = require("express-validator");
const user_1 = require("../models/user");
const utils_1 = require("../utils");
const cloudinary_1 = require("cloudinary");
const resumeUpload_1 = require("../models/resumeUpload");
const jobApply_1 = require("../models/jobApply");
const GetResumes = async (req, res, next) => {
    const authHeader = req.get('Authorization');
    const accessToken = authHeader.split(' ')[1];
    try {
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
        const resumes = await resumeUpload_1.ResumeUpload.find({ candidateId: candidate.id });
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
    const authHeader = req.get('Authorization');
    const accessToken = authHeader.split(' ')[1];
    try {
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
    const authHeader = req.get('Authorization');
    const accessToken = authHeader.split(' ')[1];
    const errors = (0, express_validator_1.validationResult)(req);
    try {
        const decodedToken = await (0, utils_1.verifyToken)(accessToken);
        const candidate = await user_1.User.findById(decodedToken.userId).populate('roleId');
        if (candidate?.get('roleId.roleName') !== 'CANDIDATE') {
            const error = new Error('UnAuthorized');
            error.statusCode = 401;
            error.result = null;
            throw error;
        }
        ;
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
    const authHeader = req.get('Authorization');
    const accessToken = authHeader.split(' ')[1];
    try {
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
        const jobApply = await jobApply_1.JobApply.findOne({ jobId: jobId, candidateId: candidate._id.toString() });
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
    const authHeader = req.get('Authorization');
    const accessToken = authHeader.split(' ')[1];
    try {
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
