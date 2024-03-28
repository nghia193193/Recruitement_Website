import { User } from "../models/user";
import * as bcrypt from 'bcryptjs';
import { v2 as cloudinary } from 'cloudinary';
import { randomBytes } from 'crypto';
import { transporter } from "../utils/sendMail";

export const userService = {
    getProfile: async (userId: string) => {
        const user = await User.findById(userId).populate('roleId') as any;
        if (!user) {
            const error: Error & { statusCode?: any, result?: any } = new Error('Không tìm thấy user');
            error.statusCode = 409;
            error.result = null;
            throw error;
        };
        const returnUser = {
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
        }
        return returnUser;
    },
    updateProfile: async (userId: string, fullName: string, address: string, dateOfBirth: any, about: string) => {
        const user = await User.findById(userId);
        if (!user) {
            const error: Error & { statusCode?: number, result?: any } = new Error('Không tìm thấy user');
            error.statusCode = 409;
            error.result = null;
            throw error;
        };
        user.fullName = fullName;
        user.address = address;
        user.dateOfBirth = new Date(dateOfBirth);
        user.about = about;
        await user.save();
        const result = {
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
        }
        return result;
    },
    changePassword: async (userId: string, currentPassword: string, newPassword: string) => {
        const user = await User.findById(userId) as any;
        if (!user) {
            const error: Error & { statusCode?: number, result?: any } = new Error('Không tìm thấy user');
            error.statusCode = 409;
            error.result = null;
            throw error;
        };
        const isEqual = await bcrypt.compare(currentPassword, user.password);
        if (!isEqual) {
            const error: Error & { statusCode?: number, result?: any } = new Error('Mật khẩu hiện tại không chính xác');
            error.statusCode = 400;
            error.result = null;
            throw error;
        };
        const hashNewPass = await bcrypt.hash(newPassword, 12);
        user.password = hashNewPass;
        await user.save();
    },
    changeAvatar: async (userId: string, avatar: any) => {
        const user = await User.findById(userId) as any;
        if (!user) {
            const error: Error & { statusCode?: number, result?: any } = new Error('Không tìm thấy user');
            error.statusCode = 409;
            error.result = null;
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
        return avatarUrl;
    },
    forgetPassword: async (email: string) => {
        const user = await User.findOne({ email: email });
        if (!user) {
            const error: Error & { statusCode?: number, result?: any } = new Error('Tài khoản không tồn tại');
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        const token = randomBytes(32).toString('hex');
        user.resetToken = token;
        user.resetTokenExpired = new Date(Date.now() + 5 * 60 * 1000);
        await user.save();
        let mailDetails = {
            from: `${process.env.MAIL_SEND}`,
            to: email,
            subject: 'Reset Password',
            html: ` 
            <div style="text-align: center; font-family: arial">
                <h1 style="color: green; ">JOB POST</h1>
                <h2>Reset Password</h2>
                <p style="margin: 1px">A password change has been requested to your account.</p>
                <p style="margin-top: 0px">If this was you, please use the link below to reset your password</p>
                <button style="background-color: #008000; padding: 10px 50px; border-radius: 5px; border-style: none"><a href="https://recruiment-website-vmc4-huutrong1101.vercel.app/forget-password/confirm-password?token=${token}" style="font-size: 15px;color: white; text-decoration: none">Reset Password</a></button>
                <p>Thank you for joining us!</p>
                <p style="color: red">Note: This link is only valid in 5 minutes!</p>
                
            </div>
            `
        };
        transporter.sendMail(mailDetails, err => {
            const error: Error = new Error('Gửi mail thất bại');
            throw error;
        });
    },
    resetPassword: async (newPassword: string, confirmPassword: string, token: string) => {
        const user = await User.findOne({ resetToken: token });
        if (!user) {
            const error: Error & { statusCode?: number, result?: any } = new Error('Token không tồn tại');
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        if ((user.resetTokenExpired as any).getTime() < new Date().getTime()) {
            const error: Error & { statusCode?: number, result?: any } = new Error('Token đã hết hạn vui lòng tạo yêu cầu mới!');
            error.statusCode = 409;
            error.result = null;
            throw error;
        }
        const hashNewPW = await bcrypt.hash(newPassword, 12);
        user.password = hashNewPW;
        await user.save();
    }
}