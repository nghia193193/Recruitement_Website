import { User } from '../models/user';
import { Role } from '../models/role';
import * as bcrypt from 'bcryptjs';
import { signAccessToken, signRefreshToken } from '../utils';
import {transporter} from '../utils/sendMail';

export const authService = {
    signUp: async (fullName: string, email: string, phone: string, password: string) => {
        const emailUser = await User.findOne({ email: email });
        if (emailUser) {
            const error: Error & { statusCode?: number, result?: any } = new Error('Email đã tồn tại');
            error.statusCode = 409;
            error.result = null;
            throw error;
        };
        const phoneUser = await User.findOne({ phone: phone });
        if (phoneUser) {
            const error: Error & { statusCode?: number, result?: any } = new Error('Số điện thoại đã tồn tại');
            error.statusCode = 409;
            error.result = null;
            throw error;
        };
        const hashedPw = await bcrypt.hash(password, 12);
        const role = await Role.findOne({ roleName: 'CANDIDATE', isActive: true });
        let otp = '';
        for (let i = 0; i < 6; i++) {
            otp += Math.floor(Math.random() * 10);
        };
        const otpExpired: Date = new Date(Date.now() + 10 * 60 * 1000);
        const user = new User({
            fullName: fullName,
            email: email,
            password: hashedPw,
            phone: phone,
            isVerifiedEmail: false,
            isActive: true,
            blackList: false,
            roleId: role ? role._id : undefined,
            otp: otp,
            otpExpired: otpExpired
        });
        await user.save();
        let mailDetails = {
            from: `${process.env.MAIL_SEND}`,
            to: email,
            subject: 'Register Account',
            html: ` 
                <div style="text-align: center; font-family: arial">
                    <h1 style="color: green; ">JOB POST</h1>
                    <h2>Welcome</h2>
                    <span style="margin: 1px">Your OTP confirmation code is: <b>${otp}</b></span>
                    <p style="margin-top: 0px">Click this link below to verify your account.</p>
                    <button style="background-color: #008000; padding: 10px 50px; border-radius: 5px; border-style: none"><a href="https://recruiment-website-vmc4-huutrong1101.vercel.app/otp?email=${email}" style="font-size: 15px;color: white; text-decoration: none">Verify</a></button>
                    <p>Thank you for joining us!</p>
                    <p style="color: red">Note: This link is only valid in 10 minutes!</p>
                </div>
                `
        };
        transporter.sendMail(mailDetails, err => {
            const error: Error = new Error('Gửi mail thất bại');
            throw error;
        });
        const accessToken = await signAccessToken(user._id);
        return { accessToken };
    },
    verifyOTP: async (email: string, otp: string) => {
        const user = await User.findOne({ email: email });
        if (!user) {
            const error: Error & { statusCode?: number, result?: any } = new Error('Email không chính xác');
            error.statusCode = 400;
            error.result = null;
            throw error;
        };
        if (user.otp !== otp) {
            const error: Error & { statusCode?: number, result?: any } = new Error('Mã xác nhận không chính xác');
            error.statusCode = 400;
            error.result = null;
            throw error;
        };
        user.isVerifiedEmail = true;
        user.otpExpired = undefined;
        await user.save();
    },
    login: async (credentialId: string, password: string) => {
        const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
        let user;
        if (emailPattern.test(credentialId)) {
            user = await User.findOne({ email: credentialId }).populate('roleId');
            if (!user) {
                const error: Error & { statusCode?: number, result?: any } = new Error('Email không chính xác');
                error.statusCode = 400;
                error.result = null;
                throw error;
            };
            if (!user.isVerifiedEmail) {
                const error: Error & { statusCode?: number, result?: any } = new Error('Vui lòng xác nhận email');
                error.statusCode = 422;
                error.result = null;
                throw error;
            };
        } else {
            user = await User.findOne({ phone: credentialId }).populate('roleId');
            if (!user) {
                const error: Error & { statusCode?: number, result?: any } = new Error('Số điện thoại không chính xác');
                error.statusCode = 400;
                error.result = null;
                throw error;
            };
            if (!user.isVerifiedEmail) {
                const error: Error & { statusCode?: number, result?: any } = new Error('Vui lòng xác nhận email');
                error.statusCode = 422;
                error.result = null;
                throw error;
            };
        };
        const isEqual = await bcrypt.compare(password, user.password);
        if (!isEqual) {
            const error: Error & { statusCode?: number, result?: any } = new Error('Mật khẩu không chính xác');
            error.statusCode = 400;
            error.result = null;
            throw error;
        };
        
        const accessToken = await signAccessToken(user._id);
        const refreshToken = await signRefreshToken(user._id);
        await user.save();
        return { accessToken, refreshToken }
    }
}
