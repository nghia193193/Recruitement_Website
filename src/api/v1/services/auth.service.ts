import { NextFunction, Request, Response } from 'express';
import { User } from '../models/user';
import { Role } from '../models/role';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { secretKey, refreshKey, transporter } from '../utils';

export const SignUp = async (req: Request, res: Response, next: NextFunction): Promise<String> => {
    const { fullName, email, phone, password, confirmPassword } = req.body;

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
    return accessToken;
};
