import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { secretKey, verifyToken } from '../utils';
import { validationResult } from 'express-validator';
import { User } from '../models/user';
import * as bcrypt from 'bcryptjs';
import {UploadedFile} from 'express-fileupload';
import {v2 as cloudinary} from 'cloudinary';

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.get('Authorization') as string;
    const accessToken = authHeader.split(' ')[1];

    try {
        const decodedToken: any = await verifyToken(accessToken);
        const user = await User.findOne({email: decodedToken.email});
        if (!user) {
            const error: Error & {statusCode?: number} = new Error('Không tìm thấy user');
            throw error;
        }
        res.status(200).json({ 
            success: true,
            message: "Lấy dữ liệu thành công",
            result: {
                userId: user._id.toString(),
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                avatar: user.avatar ? user.avatar.url : null,
                gender: user.gender ? user.gender : null,
                address: user.address ? user.address : null,
                dateOfBirth: user.dateOfBirth ? user.dateOfBirth : null,
                active: user.isActive, 
                createAt: user.createdAt,
                updateAt: user.updatedAt
            },
            statusCode: 200
         });
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null;
        }
        next(err);
    }
}

export const updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.get('Authorization') as string;
    const accessToken = authHeader.split(' ')[1];

    try {
        const decodedToken: any = await verifyToken(accessToken);
        const fullName: string = req.body.fullName;
        const address: string = req.body.address;
        const dateOfBirth: string = req.body.dateOfBirth;
        const about: string = req.body.about;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error: Error & {statusCode?: number} = new Error(errors.array()[0].msg);
            error.statusCode = 422;
            throw error;
        }
        const updateUser = await User.findOne({email: decodedToken.email});
        if (!updateUser) {
            const error: Error & {statusCode?: number} = new Error('Không tìm thấy user');
            throw error;
        }
        updateUser.fullName = fullName;
        updateUser.address = address;
        updateUser.dateOfBirth = new Date(dateOfBirth);
        updateUser.about = about;

        await updateUser.save();
        res.status(200).json({success: true, message: 'Update user thành công', statusCode: 200});
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
        }
        next(err);
    }
}

export const changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.get('Authorization') as string;
    const accessToken = authHeader.split(' ')[1];

    try {
        const decodedToken: any = await verifyToken(accessToken);
        const currentPassword: string = req.body.currentPassword;
        const newPassword: string = req.body.newPassword;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error: Error & {statusCode?: number} = new Error(errors.array()[0].msg);
            error.statusCode = 422;
            throw error;
        }
        const user = await User.findOne({email: decodedToken.email});
        if (!user) {
            const error: Error & {statusCode?: number} = new Error('Không tìm thấy user');
            throw error;
        }
        const isEqual = await bcrypt.compare(currentPassword, user.password);
        if (!isEqual) {
            const error: Error & {statusCode?: number} = new Error('Mật khẩu hiện tại không chính xác');
            error.statusCode = 401;
            throw error;
        }
        const hashNewPass = await bcrypt.hash(newPassword, 12);
        user.password = hashNewPass;
        await user.save()
        res.status(200).json({success: true, message: 'Đổi mật khẩu thành công', statusCode: 200});
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
        }
        next(err);
    }
    
}

export const changeAvatar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.get('Authorization') as string;
    const accessToken = authHeader.split(' ')[1];
      
    try {
        const decodedToken: any = await verifyToken(accessToken);
        if (!req.files || !req.files.avatarFile) {
            const error: Error & {statusCode?: number} = new Error('Không có tệp nào được tải lên!');
            error.statusCode = 400;
            throw error;
        };

        const avatar: UploadedFile = req.files.avatarFile as UploadedFile;
        if (avatar.mimetype !== 'image/jpg' && avatar.mimetype !== 'image/png' && avatar.mimetype !== 'image/jpeg') {
            const error: Error & {statusCode?: number} = new Error('File ảnh chỉ được phép là jpg,png,jpeg');
            error.statusCode = 400;
            throw error;
        }
        
        const result = await cloudinary.uploader.upload(avatar.tempFilePath);
        if (!result) {
            const error = new Error('Upload thất bại');
            throw error;
        }

        const publicId = result.public_id;
        const avatarUrl = cloudinary.url(publicId);

        const user = await User.findOne({email: decodedToken.email});
        if (!user) {
            const error: Error & {statusCode?: number} = new Error('Không tìm thấy user');
            throw error;
        };

        const oldAva = user.avatar?.publicId;
        if (oldAva) {
            await cloudinary.uploader.destroy(oldAva);
        }
        
        user.avatar = {
            publicId: publicId,
            url: avatarUrl
        };
        await user.save();
        res.status(200).json({success: true, message: 'Đổi avatar thành công', statusCode: 200});
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
        }
        next(err);
    }
    
}