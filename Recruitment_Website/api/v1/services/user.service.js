"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgetPassword = exports.changeAvatar = exports.changePassword = exports.updateProfile = exports.getProfile = void 0;
const user_1 = require("../models/user");
const bcrypt = __importStar(require("bcryptjs"));
const cloudinary_1 = require("cloudinary");
const crypto_1 = require("crypto");
const sendMail_1 = require("../utils/sendMail");
const getProfile = async (userId) => {
    const user = await user_1.User.findById(userId).populate('roleId');
    if (!user) {
        const error = new Error('Không tìm thấy user');
        error.statusCode = 409;
        error.result = null;
        throw error;
    }
    ;
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
        role: user.roleId.roleName,
        about: user.about,
        createAt: user.createdAt,
        updateAt: user.updatedAt
    };
    return returnUser;
};
exports.getProfile = getProfile;
const updateProfile = async (userId, fullName, address, dateOfBirth, about) => {
    const user = await user_1.User.findById(userId);
    if (!user) {
        const error = new Error('Không tìm thấy user');
        error.statusCode = 409;
        error.result = null;
        throw error;
    }
    ;
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
        role: user.roleId.roleName,
        about: user.about,
        createAt: user.createdAt,
        updateAt: user.updatedAt
    };
    return result;
};
exports.updateProfile = updateProfile;
const changePassword = async (userId, currentPassword, newPassword) => {
    const user = await user_1.User.findById(userId);
    if (!user) {
        const error = new Error('Không tìm thấy user');
        error.statusCode = 409;
        error.result = null;
        throw error;
    }
    ;
    const isEqual = await bcrypt.compare(currentPassword, user.password);
    if (!isEqual) {
        const error = new Error('Mật khẩu hiện tại không chính xác');
        error.statusCode = 400;
        error.result = null;
        throw error;
    }
    ;
    const hashNewPass = await bcrypt.hash(newPassword, 12);
    user.password = hashNewPass;
    await user.save();
};
exports.changePassword = changePassword;
const changeAvatar = async (userId, avatar) => {
    const user = await user_1.User.findById(userId);
    if (!user) {
        const error = new Error('Không tìm thấy user');
        error.statusCode = 409;
        error.result = null;
        throw error;
    }
    ;
    const result = await cloudinary_1.v2.uploader.upload(avatar.tempFilePath);
    if (!result) {
        const error = new Error('Upload thất bại');
        throw error;
    }
    ;
    const publicId = result.public_id;
    const avatarUrl = cloudinary_1.v2.url(publicId);
    const oldAva = user.avatar?.publicId;
    if (oldAva) {
        await cloudinary_1.v2.uploader.destroy(oldAva);
    }
    ;
    user.avatar = {
        publicId: publicId,
        url: avatarUrl
    };
    await user.save();
    return avatarUrl;
};
exports.changeAvatar = changeAvatar;
const forgetPassword = async (email) => {
    const user = await user_1.User.findOne({ email: email });
    if (!user) {
        const error = new Error('Tài khoản không tồn tại');
        error.statusCode = 400;
        error.result = null;
        throw error;
    }
    const token = (0, crypto_1.randomBytes)(32).toString('hex');
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
    sendMail_1.transporter.sendMail(mailDetails, err => {
        const error = new Error('Gửi mail thất bại');
        throw error;
    });
};
exports.forgetPassword = forgetPassword;
const resetPassword = async (newPassword, confirmPassword, token) => {
    const user = await user_1.User.findOne({ resetToken: token });
    if (!user) {
        const error = new Error('Token không tồn tại');
        error.statusCode = 400;
        error.result = null;
        throw error;
    }
    if (user.resetTokenExpired.getTime() < new Date().getTime()) {
        const error = new Error('Token đã hết hạn vui lòng tạo yêu cầu mới!');
        error.statusCode = 409;
        error.result = null;
        throw error;
    }
    const hashNewPW = await bcrypt.hash(newPassword, 12);
    user.password = hashNewPW;
    await user.save();
};
exports.resetPassword = resetPassword;
