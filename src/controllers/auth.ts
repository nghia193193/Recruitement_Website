import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { User } from '../models/user';
import { Role } from '../models/role';
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

const secretKey = 'nghiatrongrecruitementwebsitenam42023secretkey';
const refreshKey = 'nghiatrongrecruitementwebsitenam42023refreshkey'

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
        const otp = Math.floor(Math.random() * 1000000).toString();
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
            const error: Error & {statusCode?: number} = new Error('Email không chính xác');
            error.statusCode = 401;
            throw error;
        }
        if (user.otp !== otp) {
            const error: Error & {statusCode?: number} = new Error('Mã xác nhận không chính xác');
            error.statusCode = 400;
            throw error;
        }
        user.isVerifiedEmail = true;
        user.otpExpired = undefined;
        await user.save();
        res.status(200).json({ success: true, message: 'Xác thực thành công', statusCode: 200});
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
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
        console.log(user)
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
            userId: user._id,
            fullName: user.fullName,
            email: user.email,
            phone: user.phone,
            avatar: user.avatar ? user.avatar : null,
            gender: user.gender ? user.gender : null,
            address: user.address ? user.address : null,
            dateOfBirth: user.dateOfBirth ? user.dateOfBirth : null,
            active: true,
            role: user.get('roleId.roleName'),
            createAt: user.createdAt,
            updateAt: user.updatedAt ? user.updatedAt : null
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
        }
        next(err);
    }
    
};

export const isAuth = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.get('Authorization') as string;
    const accessToken = authHeader.split(' ')[1];
    jwt.verify(accessToken, secretKey, (err: jwt.VerifyErrors | null, decoded: any) => {
        if (err) {
          return res.status(401).json({ success: false, message: 'Invalid access token', statusCode: 401 });
        }
        res.status(200).json({ 
            success: true,
            message: "Lấy dữ liệu thành công",
            result: {
                userId: decoded.userId,
                fullName: decoded.fullName,
                email: decoded.email,
                phone: decoded.phone,
                avatar: decoded.avatar,
                gender: decoded.gender,
                address: decoded.address,
                dateOfBirth: decoded.dateOfBirth,
                active: decoded.active, 
                role: decoded.role,
                createAt: decoded.createAt,
                updateAt: decoded.updateAt
            },
            statusCode: 200
         });
    });
}

export const refreshAccessToken = (req: Request, res: Response, next: NextFunction) => {
    const refreshToken: string = req.body.refreshToken;
    jwt.verify(refreshToken, refreshKey, (err: jwt.VerifyErrors | null, decoded: any) => {
        if (err) {
          return res.status(401).json({ success: false, message: 'Invalid refresh token', statusCode: 401 });
        }
        const newAccessToken = jwt.sign(
            { 
                userId: decoded.userId, 
                fullName: decoded.fullName,
                email: decoded.email, 
                phone: decoded.phone,
                avatar: decoded.avatar,
                gender: decoded.gender,
                address: decoded.address,
                dateOfBirth: decoded.dateOfBirth,
                active: decoded.active, 
                role: decoded.role,
                createAt: decoded.createAt,
                updateAt: decoded.updateAt
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
