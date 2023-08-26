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
        user: 'nguyennghia193913@gmail.com',
        pass: 'rtasipfgjrhvcwdj'
    }
})

export const signup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const fullName: string = req.body.fullName;
    const email: string = req.body.email;
    const phone: string = req.body.phone;
    const password: string = req.body.password;
    const confirmedPassword: string = req.body.confirmedPassword;
    const errors = validationResult(req);
    try {
        if (!errors.isEmpty()) {
            const error: Error & {statusCode?: number, data?: any} = new Error('Validation failed');
            error.statusCode = 422;
            error.data = errors.array();
            throw error;
        }
        const hashedPw = await bcrypt.hash(password, 12);
        const role = await Role.findOne({roleName: 'Candidate', isActive: true});
        const user = new User ({
            fullName: fullName,
            email: email,
            password: hashedPw,
            phone: phone,
            isVerifiedEmail: false,
            isActive: false,
            roleId: role ? role._id : null
        })
        await user.save();
        res.status(200).json({email: email});
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
        }
        next(err);
    }
};

export const sendOTP = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const email: string = req.body.email;
    const errors = validationResult(req);
    try {
        if (!errors.isEmpty()) {
            const error: Error & {statusCode?: number, data?: any} = new Error('Validation failed');
            error.statusCode = 422;
            error.data = errors.array();
            throw error;
        }
        const otp = Math.floor(Math.random() * 1000000).toString();
        const user = await User.findOne({email: email});
        if (!user) {
            const error: Error & {statusCode?: number, data?: any} = new Error('Email không chính xác');
            error.statusCode = 422;
            throw error;
        }
        user.otp = otp;
        await user.save()
        let mailDetails = {
            from: 'nguyennghia193913@gmail.com',
            to: email,
            subject: 'Register Account',
            html: ` Mã xác nhận đăng ký của bạn là <b>${otp}</b> `
        };
        transporter.sendMail(mailDetails, err => console.log(err));
        res.status(200).json({message: 'Đã gửi otp tới email'})
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
        }
        next(err);
    }
}

export const verifyOTP = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const email: string = req.body.email;
    const otp: string = req.body.otp;
    const errors = validationResult(req);
    try {
        if (!errors.isEmpty()) {
            const error: Error & {statusCode?: number, data?: any} = new Error('Validation failed');
            error.statusCode = 422;
            error.data = errors.array();
            throw error;
        }
        const user = await User.findOne({email: email});
        if (!user) {
            const error: Error & {statusCode?: number, data?: any} = new Error('Email không chính xác');
            error.statusCode = 422;
            throw error;
        }
        if (user.otp !== otp) {
            const error: Error & {statusCode?: number, data?: any} = new Error('Mã xác nhận không chính xác');
            error.statusCode = 422;
            throw error;
        }
        user.isVerifiedEmail = true;
        await user.save();
        res.status(200).json({message: 'Xác thực thành công'});
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
        }
        next(err);
    }
}
