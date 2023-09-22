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
exports.changeAvatar = exports.changePassword = exports.updateProfile = exports.getProfile = void 0;
const utils_1 = require("../utils");
const express_validator_1 = require("express-validator");
const user_1 = require("../models/user");
const bcrypt = __importStar(require("bcryptjs"));
const cloudinary_1 = require("cloudinary");
const getProfile = async (req, res, next) => {
    const authHeader = req.get('Authorization');
    const accessToken = authHeader.split(' ')[1];
    try {
        const decodedToken = await (0, utils_1.verifyToken)(accessToken);
        const user = await user_1.User.findOne({ email: decodedToken.email });
        if (!user) {
            const error = new Error('Không tìm thấy user');
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
exports.getProfile = getProfile;
const updateProfile = async (req, res, next) => {
    const authHeader = req.get('Authorization');
    const accessToken = authHeader.split(' ')[1];
    try {
        const decodedToken = await (0, utils_1.verifyToken)(accessToken);
        const fullName = req.body.fullName;
        const address = req.body.address;
        const dateOfBirth = req.body.dateOfBirth;
        const about = req.body.about;
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            const error = new Error(errors.array()[0].msg);
            error.statusCode = 422;
            throw error;
        }
        ;
        const updateUser = await user_1.User.findOne({ email: decodedToken.email });
        if (!updateUser) {
            const error = new Error('Không tìm thấy user');
            throw error;
        }
        ;
        updateUser.fullName = fullName;
        updateUser.address = address;
        updateUser.dateOfBirth = new Date(dateOfBirth);
        updateUser.about = about;
        await updateUser.save();
        res.status(200).json({ success: true, message: 'Update user thành công', statusCode: 200 });
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
exports.updateProfile = updateProfile;
const changePassword = async (req, res, next) => {
    const authHeader = req.get('Authorization');
    const accessToken = authHeader.split(' ')[1];
    try {
        const decodedToken = await (0, utils_1.verifyToken)(accessToken);
        const currentPassword = req.body.currentPassword;
        const newPassword = req.body.newPassword;
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            const error = new Error(errors.array()[0].msg);
            error.statusCode = 422;
            throw error;
        }
        ;
        const user = await user_1.User.findOne({ email: decodedToken.email });
        if (!user) {
            const error = new Error('Không tìm thấy user');
            throw error;
        }
        ;
        const isEqual = await bcrypt.compare(currentPassword, user.password);
        if (!isEqual) {
            const error = new Error('Mật khẩu hiện tại không chính xác');
            error.statusCode = 401;
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
exports.changePassword = changePassword;
const changeAvatar = async (req, res, next) => {
    const authHeader = req.get('Authorization');
    const accessToken = authHeader.split(' ')[1];
    try {
        const decodedToken = await (0, utils_1.verifyToken)(accessToken);
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
        const user = await user_1.User.findOne({ email: decodedToken.email });
        if (!user) {
            const error = new Error('Không tìm thấy user');
            throw error;
        }
        ;
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
        res.status(200).json({ success: true, message: 'Đổi avatar thành công', statusCode: 200 });
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
exports.changeAvatar = changeAvatar;
