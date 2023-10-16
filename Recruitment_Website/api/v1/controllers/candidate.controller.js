"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteResume = exports.UploadResume = exports.GetResumes = void 0;
const express_validator_1 = require("express-validator");
const user_1 = require("../models/user");
const utils_1 = require("../utils");
const cloudinary_1 = require("cloudinary");
const resumeUpload_1 = require("../models/resumeUpload");
const GetResumes = async (req, res, next) => {
    const authHeader = req.get('Authorization');
    const accessToken = authHeader.split(' ')[1];
    try {
        const decodedToken = await (0, utils_1.verifyToken)(accessToken);
        const candidate = await user_1.User.findOne({ email: decodedToken.email }).populate('roleId');
        if (!candidate) {
            const error = new Error('Không tìm thấy user');
            error.statusCode = 409;
            throw error;
        }
        ;
        if (candidate.get('roleId.roleName') !== 'CANDIDATE') {
            const error = new Error('UnAuthorized');
            error.statusCode = 401;
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
        res.status(200).json({ success: true, message: 'Lấy list resumes thành công', result: listResumes, resumesLength: resumesLength, statusCode: 200 });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
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
        const candidate = await user_1.User.findOne({ email: decodedToken.email }).populate('roleId');
        if (!candidate) {
            const error = new Error('Không tìm thấy user');
            error.statusCode = 409;
            throw error;
        }
        ;
        if (candidate.get('roleId.roleName') !== 'CANDIDATE') {
            const error = new Error('UnAuthorized');
            error.statusCode = 401;
            throw error;
        }
        ;
        if (!req.files || !req.files.resumeFile) {
            const error = new Error('Không có tệp nào được tải lên!');
            error.statusCode = 400;
            throw error;
        }
        ;
        const resume = req.files.resumeFile;
        if (!(0, utils_1.isPDF)(resume)) {
            const error = new Error('Resume chỉ cho phép file pdf');
            error.statusCode = 400;
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
        const candidate = await user_1.User.findOne({ email: decodedToken.email }).populate('roleId');
        if (!candidate) {
            const error = new Error('Không tìm thấy user');
            error.statusCode = 409;
            throw error;
        }
        ;
        if (candidate.get('roleId.roleName') !== 'CANDIDATE') {
            const error = new Error('UnAuthorized');
            error.statusCode = 401;
            throw error;
        }
        ;
        if (!errors.isEmpty()) {
            const error = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            throw error;
        }
        ;
        const resumeId = req.params.resumeId;
        const resume = await resumeUpload_1.ResumeUpload.findById(resumeId);
        if (!resume) {
            const error = new Error('Không tìm thấy resume');
            error.statusCode = 409;
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
        }
        next(err);
    }
    ;
};
exports.DeleteResume = DeleteResume;
