import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { User } from '../models/user';
import * as jwt from 'jsonwebtoken';
import { secretKey, verifyToken, isPDF } from '../utils';
import {v2 as cloudinary} from 'cloudinary';
import { UploadedFile } from 'express-fileupload';
import { ResumeUpload } from '../models/resumeUpload';
import { Resume } from '../models/resume';
import mongoose from 'mongoose';

export const GetResumes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.get('Authorization') as string;
    const accessToken = authHeader.split(' ')[1];

    try {
        const decodedToken: any = await verifyToken(accessToken);
        const candidate = await User.findById(decodedToken.userId).populate('roleId');
        if (!candidate) {
            const error: Error & {statusCode?: number} = new Error('Không tìm thấy user');
            error.statusCode = 409;
            throw error;
        };
        if (candidate.get('roleId.roleName') !== 'CANDIDATE') {
            const error: Error & {statusCode?: number} = new Error('UnAuthorized');
            error.statusCode = 401;
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
        res.status(200).json({success: true, message: 'Lấy list resumes thành công',result: listResumes,resumesLength: resumesLength, statusCode: 200});
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
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
        if (!candidate) {
            const error: Error & {statusCode?: number} = new Error('Không tìm thấy user');
            error.statusCode = 409;
            throw error;
        };
        if (candidate.get('roleId.roleName') !== 'CANDIDATE') {
            const error: Error & {statusCode?: number} = new Error('UnAuthorized');
            error.statusCode = 401;
            throw error;
        };

        if (!req.files || !req.files.resumeFile) {
            const error: Error & {statusCode?: number} = new Error('Không có tệp nào được tải lên!');
            error.statusCode = 400;
            throw error;
        };

        const resume: UploadedFile = req.files.resumeFile as UploadedFile;
        if (!isPDF(resume)) {
            const error: Error & {statusCode?: number} = new Error('Resume chỉ cho phép file pdf');
            error.statusCode = 400;
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
        if (!candidate) {
            const error: Error & {statusCode?: number} = new Error('Không tìm thấy user');
            error.statusCode = 409;
            throw error;
        };
        if (candidate.get('roleId.roleName') !== 'CANDIDATE') {
            const error: Error & {statusCode?: number} = new Error('UnAuthorized');
            error.statusCode = 401;
            throw error;
        };

        if(!errors.isEmpty()) {
            const error: Error & {statusCode?: number} = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            throw error;
        };
        const resumeId = req.params.resumeId;
        const resume = await ResumeUpload.findById(resumeId);
        if(!resume) {
            const error: Error & {statusCode?: number} = new Error('Không tìm thấy resume');
            error.statusCode = 409;
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
        }
        next(err);
    };
};

