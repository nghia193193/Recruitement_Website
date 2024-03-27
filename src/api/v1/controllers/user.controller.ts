import { NextFunction, Request, Response } from 'express';
import { verifyAccessToken } from '../utils';
import { validationResult } from 'express-validator';
import { UploadedFile } from 'express-fileupload';
import * as userService from '../services/user.service';

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.get('Authorization') as string;
        const accessToken = authHeader.split(' ')[1];
        const decodedToken: any = await verifyAccessToken(accessToken);
        const userId = decodedToken.userId;
        const returnUser = await userService.getProfile(userId);
        res.status(200).json({
            success: true,
            message: "Lấy dữ liệu thành công",
            result: returnUser,
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

export const updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.get('Authorization') as string;
        const accessToken = authHeader.split(' ')[1];
        const decodedToken: any = await verifyAccessToken(accessToken);
        const userId = decodedToken.userId;
        const { fullName, address, dateOfBirth, about } = req.body;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error: Error & { statusCode?: number, result?: any } = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        };
        const result = await userService.updateProfile(userId, fullName, address, dateOfBirth, about);
        res.status(200).json({
            success: true,
            message: 'Update user thành công',
            result: result,
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

export const changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.get('Authorization') as string;
        const accessToken = authHeader.split(' ')[1];
        const decodedToken: any = await verifyAccessToken(accessToken);
        const userId = decodedToken.userId;
        const currentPassword: string = req.body.currentPassword;
        const newPassword: string = req.body.newPassword;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error: Error & { statusCode?: number, result?: any } = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        };
        await userService.changePassword(userId, currentPassword, newPassword);
        res.status(200).json({ success: true, message: 'Đổi mật khẩu thành công', statusCode: 200 });
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null;
        };
        next(err);
    };

};

export const changeAvatar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.get('Authorization') as string;
        const accessToken = authHeader.split(' ')[1];
        const decodedToken: any = await verifyAccessToken(accessToken);
        const userId = decodedToken.userId;
        if (!req.files || !req.files.avatarFile) {
            const error: Error & { statusCode?: number, result?: any } = new Error('Không có tệp nào được tải lên!');
            error.statusCode = 400;
            error.result = null;
            throw error;
        };
        const avatar: UploadedFile = req.files.avatarFile as UploadedFile;
        if (avatar.mimetype !== 'image/jpg' && avatar.mimetype !== 'image/png' && avatar.mimetype !== 'image/jpeg') {
            const error: Error & { statusCode?: number, result?: any } = new Error('File ảnh chỉ được phép là jpg,png,jpeg');
            error.statusCode = 400;
            error.result = null;
            throw error;
        };
        const avatarUrl = await userService.changeAvatar(userId, avatar);
        res.status(200).json({ success: true, message: 'Đổi avatar thành công', result: avatarUrl, statusCode: 200 });
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null;
        };
        next(err);
    };

};

export const forgetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const email: string = req.body.email;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error: Error & { statusCode?: number, result?: any } = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        await userService.forgetPassword(email);
        res.json({ success: true, message: "Đã gửi email" });
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null;
        };
        next(err);
    };
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { newPassword, confirmPassword, token } = req.body;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error: Error & { statusCode?: number, result?: any } = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        if (confirmPassword !== newPassword) {
            const error: Error & { statusCode?: number, result?: any } = new Error('Mật khẩu xác nhận không chính xác');
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        await userService.resetPassword(newPassword, confirmPassword, token);
        res.json({ success: true, message: "Đổi mật khẩu thành công" });
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null;
        };
        next(err);
    };
};