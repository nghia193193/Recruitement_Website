import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { User } from '../models/user';
import { Role } from '../models/role';
import { secretKey, refreshKey, transporter } from '../utils';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';


export const Signup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { fullName, email, phone, password, confirmPassword } = req.body;
    const errors = validationResult(req);
    try {
        if (!errors.isEmpty()) {
            const error: Error & {statusCode?: number, result?: any} = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        };
        if (confirmPassword !== password) {
            const error: Error & {statusCode?: number} = new Error('Mật khẩu xác nhận không chính xác');
            error.statusCode = 400;
            throw error;
        };
        const emailUser = await User.findOne({email: email});
        if (emailUser) {
            const error: Error & {statusCode?: number} = new Error('Email đã tồn tại');
            error.statusCode = 409;
            throw error;
        };
        const phoneUser = await User.findOne({phone: phone});
        if (phoneUser) {
            const error: Error & {statusCode?: number} = new Error('Số điện thoại đã tồn tại');
            error.statusCode = 409;
            throw error;
        };
        const hashedPw = await bcrypt.hash(password, 12);
        const role = await Role.findOne({roleName: 'CANDIDATE', isActive: true});
        let otp = '';
        for (let i = 0; i < 6; i++) {
            otp += Math.floor(Math.random() * 10);
        };
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
        });
        await user.save();
        let mailDetails = {
            from: 'nguyennghia193913@gmail.com',
            to: email,
            subject: 'Register Account',
            html: ` 
            <div style="text-align: center; font-family: arial">
                <h1 style="color: green; ">JOB POST</h1>
                <h2>Welcome</h2>
                <span style="margin: 1px">Your OTP confirmation code is: <b>${otp}</b></span>
                <p style="margin-top: 0px">Click this link below to verify your account.</p>
                <button style="background-color: #008000; padding: 10px 50px; border-radius: 5px; border-style: none"><a href="http://localhost:5173/otp?email=${email}" style="font-size: 15px;color: white; text-decoration: none">Verify</a></button>
                <p>Thank you for joining us!</p>
                <p style="color: red">Note: This link is only valid in 10 minutes!</p>
            </div>
            `
        };
        transporter.sendMail(mailDetails, err => {
            const error: Error = new Error('Gửi mail thất bại');
            throw error;
        });
        const payload = {
            userId: user._id,
            email: user.email,
            phone: user.phone
        };
        const accessToken = jwt.sign(payload, secretKey, { expiresIn: '1h' });
        res.status(200).json({ success: true, message: 'Sing up success!', result: accessToken, statusCode: 200 });
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null;
        }
        next(err);
    };
};

export const VerifyOTP = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email, otp } = req.body;
    const errors = validationResult(req);
    try {
        if (!errors.isEmpty()) {
            const error: Error & {statusCode?: number, result?: any} = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        };
        const user = await User.findOne({email: email});
        if (!user) {
            const error: Error & {statusCode?: number, result?: any} = new Error('Email không chính xác');
            error.statusCode = 400;
            error.result = null;
            throw error;
        };
        if (user.otp !== otp) {
            const error: Error & {statusCode?: number, result?: any} = new Error('Mã xác nhận không chính xác');
            error.statusCode = 400;
            error.result = null;
            throw error;
        };
        user.isVerifiedEmail = true;
        user.otpExpired = undefined;
        await user.save();
        res.status(200).json({ success: true, message: 'Xác thực thành công', statusCode: 200});
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null
        };
        next(err);
    };
};

export const Login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { credentialId, password } = req.body;
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    const errors = validationResult(req);
    try {
        if (!errors.isEmpty()) {
            const error: Error & {statusCode?: number, result?: any} = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        };
        let user;
        if (emailPattern.test(credentialId)) {
            user = await User.findOne({email: credentialId}).populate('roleId');
            if (!user) {
                const error: Error & {statusCode?: number, result?: any} = new Error('Email không chính xác');
                error.statusCode = 400;
                error.result = null;
                throw error;
            };
            if (!user.isVerifiedEmail) {
                const error: Error & {statusCode?: number, result?: any} = new Error('Vui lòng xác nhận email');
                error.statusCode = 422;
                error.result = null;
                throw error;
            };
        } else {
            user = await User.findOne({phone: credentialId}).populate('roleId');
            if (!user) {
                const error: Error & {statusCode?: number, result?: any} = new Error('Số điện thoại không chính xác');
                error.statusCode = 400;
                error.result = null;
                throw error;
            };
            if (!user.isVerifiedEmail) {
                const error: Error & {statusCode?: number, result?: any} = new Error('Vui lòng xác nhận email');
                error.statusCode = 422;
                error.result = null;
                throw error;
            };
        };
        const isEqual = await bcrypt.compare(password, user.password);
        if (!isEqual) {
            const error: Error & {statusCode?: number, result?: any} = new Error('Mật khẩu không chính xác');
            error.statusCode = 400;
            error.result = null;
            throw error;
        };
        user.isActive = true;
        await user.save();
        const payload = {
            email: user.email
        };
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
            (err as any).result = null;
        }
        next(err);
    };
    
};

export const RefreshAccessToken = (req: Request, res: Response, next: NextFunction) => {
    const refreshToken: string = req.body.refreshToken;
    jwt.verify(refreshToken, refreshKey, (err: jwt.VerifyErrors | null, decoded: any) => {
        if (err) {
          return res.status(401).json({ success: false, message: 'Invalid or expired refresh token', statusCode: 401 });
        };
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
};
