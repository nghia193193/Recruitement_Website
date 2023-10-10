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
exports.ResetPassword = exports.ForgotPassword = exports.ChangeAvatar = exports.ChangePassword = exports.UpdateProfile = exports.GetProfile = void 0;
const utils_1 = require("../utils");
const express_validator_1 = require("express-validator");
const user_1 = require("../models/user");
const bcrypt = __importStar(require("bcryptjs"));
const cloudinary_1 = require("cloudinary");
const crypto_1 = require("crypto");
const GetProfile = async (req, res, next) => {
    const authHeader = req.get('Authorization');
    const accessToken = authHeader.split(' ')[1];
    try {
        const decodedToken = await (0, utils_1.verifyToken)(accessToken);
        const user = await user_1.User.findOne({ email: decodedToken.email }).populate('roleId');
        if (!user) {
            const error = new Error('Không tìm thấy user');
            error.statusCode = 409;
            throw error;
        }
        ;
        res.status(200).json({
            success: true,
            message: "Lấy dữ liệu thành công",
            result: {
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
            },
            statusCode: 200
        });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        ;
        next(err);
    }
    ;
};
exports.GetProfile = GetProfile;
const UpdateProfile = async (req, res, next) => {
    const authHeader = req.get('Authorization');
    const accessToken = authHeader.split(' ')[1];
    try {
        const decodedToken = await (0, utils_1.verifyToken)(accessToken);
        const { fullName, address, dateOfBirth, about } = req.body;
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            console.log(errors.array());
            const error = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            throw error;
        }
        ;
        const updateUser = await user_1.User.findOne({ email: decodedToken.email });
        if (!updateUser) {
            const error = new Error('Không tìm thấy user');
            error.statusCode = 409;
            throw error;
        }
        ;
        updateUser.fullName = fullName;
        updateUser.address = address;
        updateUser.dateOfBirth = new Date(dateOfBirth);
        updateUser.about = about;
        const user = await updateUser.save();
        res.status(200).json({
            success: true,
            message: 'Update user thành công',
            result: {
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
            },
            statusCode: 200
        });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        ;
        next(err);
    }
    ;
};
exports.UpdateProfile = UpdateProfile;
const ChangePassword = async (req, res, next) => {
    const authHeader = req.get('Authorization');
    const accessToken = authHeader.split(' ')[1];
    try {
        const decodedToken = await (0, utils_1.verifyToken)(accessToken);
        const currentPassword = req.body.currentPassword;
        const newPassword = req.body.newPassword;
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            const error = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            throw error;
        }
        ;
        const user = await user_1.User.findOne({ email: decodedToken.email });
        if (!user) {
            const error = new Error('Không tìm thấy user');
            error.statusCode = 409;
            throw error;
        }
        ;
        const isEqual = await bcrypt.compare(currentPassword, user.password);
        if (!isEqual) {
            const error = new Error('Mật khẩu hiện tại không chính xác');
            error.statusCode = 400;
            throw error;
        }
        ;
        const hashNewPass = await bcrypt.hash(newPassword, 12);
        user.password = hashNewPass;
        await user.save();
        res.status(200).json({ success: true, message: 'Đổi mật khẩu thành công', statusCode: 200 });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        ;
        next(err);
    }
    ;
};
exports.ChangePassword = ChangePassword;
const ChangeAvatar = async (req, res, next) => {
    const authHeader = req.get('Authorization');
    const accessToken = authHeader.split(' ')[1];
    try {
        const decodedToken = await (0, utils_1.verifyToken)(accessToken);
        const user = await user_1.User.findOne({ email: decodedToken.email });
        if (!user) {
            const error = new Error('Không tìm thấy user');
            error.statusCode = 409;
            throw error;
        }
        ;
        if (!req.files || !req.files.avatarFile) {
            const error = new Error('Không có tệp nào được tải lên!');
            error.statusCode = 400;
            throw error;
        }
        ;
        const avatar = req.files.avatarFile;
        if (avatar.mimetype !== 'image/jpg' && avatar.mimetype !== 'image/png' && avatar.mimetype !== 'image/jpeg') {
            const error = new Error('File ảnh chỉ được phép là jpg,png,jpeg');
            error.statusCode = 400;
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
        res.status(200).json({ success: true, message: 'Đổi avatar thành công', result: avatarUrl, statusCode: 200 });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        ;
        next(err);
    }
    ;
};
exports.ChangeAvatar = ChangeAvatar;
const ForgotPassword = async (req, res, next) => {
    const email = req.body.email;
    const errors = (0, express_validator_1.validationResult)(req);
    try {
        if (!errors.isEmpty()) {
            const error = new Error(errors.array()[0].msg);
            error.statusCode = 422;
            throw error;
        }
        const user = await user_1.User.findOne({ email: email });
        if (!user) {
            const error = new Error('Tài khoản không tồn tại');
            error.statusCode = 400;
            throw error;
        }
        const token = (0, crypto_1.randomBytes)(32).toString('hex');
        user.resetToken = token;
        user.resetTokenExpired = new Date(Date.now() + 5 * 60 * 1000);
        await user.save();
        let mailDetails = {
            from: 'nguyennghia193913@gmail.com',
            to: email,
            subject: 'Reset Password',
            html: ` 
            <div style="text-align: center; font-family: arial">
                <h1 style="color: green; ">JOB POST</h1>
                <h2>Reset Password</h2>
                <p style="margin: 1px">A password change has been requested to your account.</p>
                <p style="margin-top: 0px">If this was you, please use the link below to reset your password</p>
                <button style="background-color: #008000; padding: 10px 50px; border-radius: 5px; border-style: none"><a href="http://localhost:5173/forget-password/confirm-password?token=${token}" style="font-size: 15px;color: white; text-decoration: none">Reset Password</a></button>
                <p>Thank you for joining us!</p>
                <p style="color: red">Note: This link is only valid in 5 minutes!</p>
                
            </div>
            `
        };
        utils_1.transporter.sendMail(mailDetails, err => {
            const error = new Error('Gửi mail thất bại');
            throw error;
        });
        res.json({ success: true, message: "Đã gửi email" });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        ;
        next(err);
    }
    ;
};
exports.ForgotPassword = ForgotPassword;
const ResetPassword = async (req, res, next) => {
    const { newPassword, confirmPassword, token } = req.body;
    const errors = (0, express_validator_1.validationResult)(req);
    try {
        if (!errors.isEmpty()) {
            const error = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            throw error;
        }
        if (confirmPassword !== newPassword) {
            const error = new Error('Mật khẩu xác nhận không chính xác');
            error.statusCode = 400;
            throw error;
        }
        const user = await user_1.User.findOne({ resetToken: token });
        if (!user) {
            const error = new Error('Token không tồn tại');
            error.statusCode = 400;
            throw error;
        }
        if (user.resetTokenExpired.getTime() < new Date().getTime()) {
            const error = new Error('Token đã hết hạn vui lòng tạo yêu cầu mới!');
            error.statusCode = 409;
            throw error;
        }
        const hashNewPW = await bcrypt.hash(newPassword, 12);
        user.password = hashNewPW;
        await user.save();
        res.json({ success: true, message: "Đổi mật khẩu thành công" });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        ;
        next(err);
    }
    ;
};
exports.ResetPassword = ResetPassword;
