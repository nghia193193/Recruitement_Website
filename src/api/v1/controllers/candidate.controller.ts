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

export const getResumes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.get('Authorization') as string;
    const accessToken = authHeader.split(' ')[1];

    try {
        const decodedToken: any = await verifyToken(accessToken);
        const candidate = await User.findOne({email: decodedToken.email});
        if (!candidate) {
            const error: Error & {statusCode?: number} = new Error('Không tìm thấy user');
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
            }
        })
        res.status(200).json({success: true, message: 'Lấy list resumes thành công',result: listResumes,resumesLength: resumesLength, statusCode: 200});
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
        }
        next(err);
    }
}

export const uploadResume = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.get('Authorization') as string;
    const accessToken = authHeader.split(' ')[1];

    try {
        const decodedToken: any = await verifyToken(accessToken);
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
        }

        const publicId = result.public_id;
        const resumeUrl = cloudinary.url(publicId);

        const candidate = await User.findOne({email: decodedToken.email});
        if (!candidate) {
            const error: Error & {statusCode?: number} = new Error('Không tìm thấy user');
            throw error;
        };

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
        }
        
        res.status(200).json({success: true, message: 'Upload resume thành công',result: cvInfo, statusCode: 200});
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
        }
        next(err);
    }
}

export const deleteResume = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.get('Authorization') as string;
    const accessToken = authHeader.split(' ')[1];
    const errors = validationResult(req);
    try {
        const decodedToken: any = await verifyToken(accessToken);
        if(!errors.isEmpty()) {
            const error: Error & {statusCode?: number} = new Error(errors.array()[0].msg);
            error.statusCode = 422;
            throw error;
        }
        const resumeId = new mongoose.Types.ObjectId(req.params.resumeId);
        const resume = await ResumeUpload.findOne({_id: resumeId});
        if(!resume) {
            const error: Error = new Error('Không tìm thấy resume');
            throw error;
        }
        const publicId = resume.publicId;
        const isDelete = await ResumeUpload.findOneAndDelete({_id: resumeId});
        if (!isDelete) {
            const error: Error = new Error('Xóa resume thất bại');
            throw error;
        }
        await cloudinary.uploader.destroy(publicId);
        res.status(200).json({success: true, message: 'Xóa resume thành công', statusCode: 200});
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
        }
        next(err);
    }
}