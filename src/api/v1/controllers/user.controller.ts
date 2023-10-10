import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { secretKey, verifyToken, transporter } from '../utils';
import { validationResult } from 'express-validator';
import { User } from '../models/user';
import * as bcrypt from 'bcryptjs';
import {UploadedFile} from 'express-fileupload';
import {v2 as cloudinary} from 'cloudinary';
import {randomBytes} from 'crypto';

export const GetProfile = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.get('Authorization') as string;
    const accessToken = authHeader.split(' ')[1];

    try {
        const decodedToken: any = await verifyToken(accessToken);
        const user = await User.findOne({email: decodedToken.email}).populate('roleId');
        if (!user) {
            const error: Error & {statusCode?: number} = new Error('Không tìm thấy user');
            error.statusCode = 409;
            throw error;
        };
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
                role: (user.roleId as any).roleName,
                about: user.about,
                createAt: user.createdAt,
                updateAt: user.updatedAt
            },
            statusCode: 200
         });
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null;
        };
        next(err);
    };
};

export const UpdateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.get('Authorization') as string;
    const accessToken = authHeader.split(' ')[1];

    try {
        const decodedToken: any = await verifyToken(accessToken);
        const { fullName, address, dateOfBirth, about} = req.body;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log(errors.array());
            const error: Error & {statusCode?: number} = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            throw error;
        };
        const updateUser = await User.findOne({email: decodedToken.email});
        if (!updateUser) {
            const error: Error & {statusCode?: number} = new Error('Không tìm thấy user');
            error.statusCode = 409;
            throw error;
        };
        updateUser.fullName = fullName;
        updateUser.address = address;
        updateUser.dateOfBirth = new Date(dateOfBirth);
        updateUser.about = about;

        const user = await updateUser.save();
        res.status(200).json({
            success: true, 
            message: 'Update user thành công',
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
                role: (user.roleId as any).roleName,
                about: user.about,
                createAt: user.createdAt,
                updateAt: user.updatedAt
            }, 
            statusCode: 200});
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
        };
        next(err);
    };
};

export const ChangePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.get('Authorization') as string;
    const accessToken = authHeader.split(' ')[1];

    try {
        const decodedToken: any = await verifyToken(accessToken);
        const currentPassword: string = req.body.currentPassword;
        const newPassword: string = req.body.newPassword;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error: Error & {statusCode?: number} = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            throw error;
        };
        const user = await User.findOne({email: decodedToken.email});
        if (!user) {
            const error: Error & {statusCode?: number} = new Error('Không tìm thấy user');
            error.statusCode = 409;
            throw error;
        };
        const isEqual = await bcrypt.compare(currentPassword, user.password);
        if (!isEqual) {
            const error: Error & {statusCode?: number} = new Error('Mật khẩu hiện tại không chính xác');
            error.statusCode = 400;
            throw error;
        };
        const hashNewPass = await bcrypt.hash(newPassword, 12);
        user.password = hashNewPass;
        await user.save();
        res.status(200).json({success: true, message: 'Đổi mật khẩu thành công', statusCode: 200});
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
        };
        next(err);
    };
    
};

export const ChangeAvatar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.get('Authorization') as string;
    const accessToken = authHeader.split(' ')[1];
      
    try {
        const decodedToken: any = await verifyToken(accessToken);
        const user = await User.findOne({email: decodedToken.email});
        if (!user) {
            const error: Error & {statusCode?: number} = new Error('Không tìm thấy user');
            error.statusCode = 409;
            throw error;
        };

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
        };
        
        const result = await cloudinary.uploader.upload(avatar.tempFilePath);
        if (!result) {
            const error = new Error('Upload thất bại');
            throw error;
        };

        const publicId = result.public_id;
        const avatarUrl = cloudinary.url(publicId);

        const oldAva = user.avatar?.publicId;
        if (oldAva) {
            await cloudinary.uploader.destroy(oldAva);
        };
        
        user.avatar = {
            publicId: publicId,
            url: avatarUrl
        };
        await user.save();
        res.status(200).json({success: true, message: 'Đổi avatar thành công', result: avatarUrl, statusCode: 200});
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
        };
        next(err);
    };
    
};

export const ForgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const email: string = req.body.email;
    const errors = validationResult(req);
    try {
        if (!errors.isEmpty()) {
            const error: Error & {statusCode?: number} = new Error(errors.array()[0].msg);
            error.statusCode = 422;
            throw error;
        }
        const user = await User.findOne({email: email});
        if (!user) {
            const error: Error & {statusCode?: number, result?: any} = new Error('Tài khoản không tồn tại');
            error.statusCode = 400;
            throw error;
        }
        const token = randomBytes(32).toString('hex');
        user.resetToken = token;
        user.resetTokenExpired = new Date(Date.now() + 5*60*1000);
        await user.save();
        let mailDetails = {
            from: 'nguyennghia193913@gmail.com',
            to: email,
            subject: 'Reset Password',
            html: ` 
            <div style="text-align: center; font-family: arial">
                <h1 style="color: green; ">JOB POST</h1>
                <h2>Reset Password</h2>
                <p style="margin: 1px">A password change has been requested to your account.</p>
                <p style="margin-top: 0px">If this was you, please use the link below to reset your password</p>
                <button style="background-color: #008000; padding: 10px 50px; border-radius: 5px; border-style: none"><a href="http://localhost:5173/forget-password/confirm-password?token=${token}" style="font-size: 15px;color: white; text-decoration: none">Reset Password</a></button>
                <p>Thank you for joining us!</p>
                <p style="color: red">Note: This link is only valid in 5 minutes!</p>
                
            </div>
            `
        };
        transporter.sendMail(mailDetails, err => {
            const error: Error = new Error('Gửi mail thất bại');
            throw error;
        });
        res.json({success: true, message: "Đã gửi email"});
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
        };
        next(err);
    };
};

export const ResetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { newPassword, confirmPassword, token } = req.body;
    const errors = validationResult(req);
    try {
        if (!errors.isEmpty()) {
            const error: Error & {statusCode?: number} = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            throw error;
        }
        if (confirmPassword !== newPassword) {
            const error: Error & {statusCode?: number} = new Error('Mật khẩu xác nhận không chính xác');
            error.statusCode = 400;
            throw error;
        }
        const user = await User.findOne({resetToken: token});
        if (!user) {
            const error: Error & {statusCode?: number, result?: any} = new Error('Token không tồn tại');
            error.statusCode = 400;
            throw error;
        }
        if ((user.resetTokenExpired as any).getTime() < new Date().getTime()) {
            const error: Error & {statusCode?: number} = new Error('Token đã hết hạn vui lòng tạo yêu cầu mới!');
            error.statusCode = 409;
            throw error;
        }
        const hashNewPW = await bcrypt.hash(newPassword, 12);
        user.password = hashNewPW;
        await user.save();
        res.json({success: true, message: "Đổi mật khẩu thành công"});
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
        };
        next(err);
    };
};