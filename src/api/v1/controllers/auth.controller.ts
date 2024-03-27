import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils';
import * as authService from '../services/auth.service';
import createHttpError from 'http-errors';


export const signUp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { fullName, email, phone, password, confirmPassword } = req.body;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error: Error & { statusCode?: number, result?: any } = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        };
        if (confirmPassword !== password) {
            const error: Error & { statusCode?: number, result?: any } = new Error('Mật khẩu xác nhận không chính xác');
            error.statusCode = 400;
            error.result = null;
            throw error;
        };
        const { accessToken } = await authService.signUp(fullName, email, phone, password);
        res.status(200).json({ success: true, message: 'Sing up success!', result: accessToken, statusCode: 200 });
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null;
        }
        next(err);
    };
};

export const verifyOTP = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { email, otp } = req.body;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error: Error & { statusCode?: number, result?: any } = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        };
        await authService.verifyOTP(email, otp);
        res.status(200).json({ success: true, message: 'Xác thực thành công', statusCode: 200 });
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null
        };
        next(err);
    };
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { credentialId, password } = req.body;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error: Error & { statusCode?: number, result?: any } = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        };
        const { accessToken, refreshToken } = await authService.login(credentialId, password);
        res.status(200).json(
            {
                success: true,
                message: "Login successful!",
                result: {
                    accessToken: accessToken,
                    refreshToken: refreshToken
                },
                statusCode: 200
            });
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null;
        }
        next(err);
    };

};

export const refreshAccessToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const refreshToken: string = req.body.refreshToken;
        if (!refreshToken) {
            throw createHttpError.BadRequest();
        }
        const { userId }: any = await verifyRefreshToken(refreshToken);
        const accessToken = await signAccessToken(userId);
        const rfToken = await signRefreshToken(userId);
        res.status(200).json(
            {
                success: true,
                message: "Làm mới token thành công",
                result: {
                    accessToken: accessToken,
                    refreshToken: rfToken
                },
                statusCode: 200
            }
        );
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null;
        }
        next(err);
    }
};
