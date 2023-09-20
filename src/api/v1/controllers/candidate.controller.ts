import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { User } from '../models/user';
import * as jwt from 'jsonwebtoken';
import { secretKey, verifyToken, isPDF } from '../utils';
import {v2 as cloudinary} from 'cloudinary';
import { UploadedFile } from 'express-fileupload';
import { ResumeUpload } from '../models/resumeUpload';
import { Resume } from '../models/resume';

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

        const cv = new ResumeUpload({
            publicId: publicId,
            linkResumeUpload: resumeUrl
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