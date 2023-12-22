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
const utils_1 = require("../utils");
const express_validator_1 = require("express-validator");
const userService = __importStar(require("../services/user.service"));
const getProfile = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyToken)(accessToken);
        const userId = decodedToken.userId;
        const returnUser = await userService.getProfile(userId);
        res.status(200).json({
            success: true,
            message: "Lấy dữ liệu thành công",
            result: returnUser,
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
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyToken)(accessToken);
        const userId = decodedToken.userId;
        const { fullName, address, dateOfBirth, about } = req.body;
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            const error = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        ;
        const result = await userService.updateProfile(userId, fullName, address, dateOfBirth, about);
        res.status(200).json({
            success: true,
            message: 'Update user thành công',
            result: result,
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
exports.updateProfile = updateProfile;
const changePassword = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyToken)(accessToken);
        const userId = decodedToken.userId;
        const currentPassword = req.body.currentPassword;
        const newPassword = req.body.newPassword;
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            const error = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        ;
        await userService.changePassword(userId, currentPassword, newPassword);
        res.status(200).json({ success: true, message: 'Đổi mật khẩu thành công', statusCode: 200 });
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
exports.changePassword = changePassword;
const changeAvatar = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader.split(' ')[1];
        const decodedToken = await (0, utils_1.verifyToken)(accessToken);
        const userId = decodedToken.userId;
        if (!req.files || !req.files.avatarFile) {
            const error = new Error('Không có tệp nào được tải lên!');
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        ;
        const avatar = req.files.avatarFile;
        if (avatar.mimetype !== 'image/jpg' && avatar.mimetype !== 'image/png' && avatar.mimetype !== 'image/jpeg') {
            const error = new Error('File ảnh chỉ được phép là jpg,png,jpeg');
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        ;
        const avatarUrl = await userService.changeAvatar(userId, avatar);
        res.status(200).json({ success: true, message: 'Đổi avatar thành công', result: avatarUrl, statusCode: 200 });
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
exports.changeAvatar = changeAvatar;
const forgetPassword = async (req, res, next) => {
    try {
        const email = req.body.email;
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            const error = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        await userService.forgetPassword(email);
        res.json({ success: true, message: "Đã gửi email" });
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
exports.forgetPassword = forgetPassword;
const resetPassword = async (req, res, next) => {
    try {
        const { newPassword, confirmPassword, token } = req.body;
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            const error = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        if (confirmPassword !== newPassword) {
            const error = new Error('Mật khẩu xác nhận không chính xác');
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        await userService.resetPassword(newPassword, confirmPassword, token);
        res.json({ success: true, message: "Đổi mật khẩu thành công" });
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
exports.resetPassword = resetPassword;
