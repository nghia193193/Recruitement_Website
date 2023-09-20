"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadResume = void 0;
const utils_1 = require("../utils");
const cloudinary_1 = require("cloudinary");
const resumeUpload_1 = require("../models/resumeUpload");
const uploadResume = async (req, res, next) => {
    const authHeader = req.get('Authorization');
    const accessToken = authHeader.split(' ')[1];
    try {
        const decodedToken = await (0, utils_1.verifyToken)(accessToken);
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
        const publicId = result.public_id;
        const resumeUrl = cloudinary_1.v2.url(publicId);
        const cv = new resumeUpload_1.ResumeUpload({
            publicId: publicId,
            linkResumeUpload: resumeUrl
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
        next(err);
    }
};
exports.uploadResume = uploadResume;
