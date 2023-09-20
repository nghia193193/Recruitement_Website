import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { User } from '../models/user';
import { Role } from '../models/role';
import { secretKey, refreshKey } from '../utils';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import * as nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
})

export const signup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const fullName: string = req.body.fullName;
    const email: string = req.body.email;
    const phone: string = req.body.phone;
    const password: string = req.body.password;
    const confirmPassword: string = req.body.confirmPassword;
    const errors = validationResult(req);
    try {
        if (!errors.isEmpty()) {
            const error: Error & {statusCode?: number, result?: any} = new Error(errors.array()[0].msg);
            error.statusCode = 422;
            error.result = null;
            throw error;
        }
        if (confirmPassword !== password) {
            const error: Error & {statusCode?: number} = new Error('Mật khẩu xác nhận không chính xác');
            error.statusCode = 401;
            throw error;
        }
        const emailUser = await User.findOne({email: email});
        if (emailUser) {
            const error: Error & {statusCode?: number} = new Error('Email đã tồn tại');
            error.statusCode = 409;
            throw error;
        }
        const phoneUser = await User.findOne({phone: phone});
        if (phoneUser) {
            const error: Error & {statusCode?: number} = new Error('Số điện thoại đã tồn tại');
            error.statusCode = 409;
            throw error;
        }
        const hashedPw = await bcrypt.hash(password, 12);
        const role = await Role.findOne({roleName: 'CANDIDATE', isActive: true});
        let otp = '';
        for (let i = 0; i < 6; i++) {
            otp += Math.floor(Math.random() * 10);
        }
        const otpExpired: Date = new Date(Date.now() + 10*60*1000);
        const user = new User ({
            fullName: fullName,
            email: email,
            password: hashedPw,
            phone: phone,
            isVerifiedEmail: false,
            isActive: false,
            roleId: role ? role._id : undefined,
            otp: otp,
            otpExpired: otpExpired
        })
        await user.save();
        let mailDetails = {
            from: 'nguyennghia193913@gmail.com',
            to: email,
            subject: 'Register Account',
            html: ` 
                Mã xác nhận đăng ký của bạn là <b>${otp}</b>
                <br>
                <h3 style="color: red">Vui lòng xác nhận trong vòng 10 phút</h3>
                <br>
                Vui lòng xác nhận ở đường link sau:
                http://localhost:5173/otp?email=${email}
            `
        };
        transporter.sendMail(mailDetails, err => console.log(err));
        const payload = {
            userId: user._id,
            email: user.email,
            phone: user.phone
        }
        const accessToken = jwt.sign(payload, secretKey, { expiresIn: '1h' });
        res.status(200).json({ success: true, message: 'Sing up success!', result: accessToken, statusCode: 200 });
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null
        }
        next(err);
    }
};

export const verifyOTP = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const email: string = req.body.email;
    const otp: string = req.body.otp;
    const errors = validationResult(req);
    try {
        if (!errors.isEmpty()) {
            const error: Error & {statusCode?: number, result?: any} = new Error(errors.array()[0].msg);
            error.statusCode = 422;
            error.result = null;
            throw error;
        }
        const user = await User.findOne({email: email});
        if (!user) {
            const error: Error & {statusCode?: number, result?: any} = new Error('Email không chính xác');
            error.statusCode = 401;
            error.result = null;
            throw error;
        }
        if (user.otp !== otp) {
            const error: Error & {statusCode?: number, result?: any} = new Error('Mã xác nhận không chính xác');
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        user.isVerifiedEmail = true;
        user.otpExpired = undefined;
        await user.save();
        res.status(200).json({ success: true, message: 'Xác thực thành công', statusCode: 200});
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null
        }
        next(err);
    }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const credentialId: string = req.body.credentialId;
    const password: string = req.body.password;
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    const errors = validationResult(req);
    try {
        if (!errors.isEmpty()) {
            const error: Error & {statusCode?: number, result?: any} = new Error(errors.array()[0].msg);
            error.statusCode = 422;
            error.result = null;
            throw error;
        }
        let user;
        if (emailPattern.test(credentialId)) {
            user = await User.findOne({email: credentialId}).populate('roleId');
            if (!user) {
                const error: Error & {statusCode?: number, result?: any} = new Error('Email không chính xác');
                error.statusCode = 401;
                error.result = null;
                throw error;
            }
            if (!user.isVerifiedEmail) {
                const error: Error & {statusCode?: number, result?: any} = new Error('Vui lòng xác nhận email');
                error.statusCode = 401;
                error.result = null;
                throw error;
            }
        } else {
            user = await User.findOne({phone: credentialId}).populate('roleId');
            if (!user) {
                const error: Error & {statusCode?: number, result?: any} = new Error('Số điện thoại không chính xác');
                error.statusCode = 401;
                error.result = null;
                throw error;
            }
            if (!user.isVerifiedEmail) {
                const error: Error & {statusCode?: number, result?: any} = new Error('Vui lòng xác nhận email');
                error.statusCode = 401;
                error.result = null;
                throw error;
            }
        }
        const isEqual = await bcrypt.compare(password, user.password);
        if (!isEqual) {
            const error: Error & {statusCode?: number, result?: any} = new Error('Mật khẩu không chính xác');
            error.statusCode = 401;
            error.result = null;
            throw error;
        }
        user.isActive = true;
        await user.save();
        const payload = {
            email: user.email
        }
        const accessToken = jwt.sign(payload, secretKey, { expiresIn: '1h' });
        const refreshToken = jwt.sign(payload, refreshKey, {expiresIn: '7d'});
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
            (err as any).result = null
        }
        next(err);
    }
    
};

export const refreshAccessToken = (req: Request, res: Response, next: NextFunction) => {
    const refreshToken: string = req.body.refreshToken;
    jwt.verify(refreshToken, refreshKey, (err: jwt.VerifyErrors | null, decoded: any) => {
        if (err) {
          return res.status(401).json({ success: false, message: 'Invalid or expired refresh token', statusCode: 401 });
        }
        const newAccessToken = jwt.sign(
            { 
                email: decoded.email
            }, secretKey, { expiresIn: '1h' });
        res.status(200).json(
            { 
                success: true,
                message: "Làm mới token thành công", 
                result: {
                    accessToken: newAccessToken
                },
                statusCode: 200 
            }
        );
    });
}
