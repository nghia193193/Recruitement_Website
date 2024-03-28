"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = void 0;
const utils_1 = require("../utils");
const express_validator_1 = require("express-validator");
const user_service_1 = require("../services/user.service");
exports.userController = {
    getProfile: async (req, res, next) => {
        try {
            const authHeader = req.get('Authorization');
            const accessToken = authHeader.split(' ')[1];
            const decodedToken = await (0, utils_1.verifyAccessToken)(accessToken);
            const userId = decodedToken.userId;
            const returnUser = await user_service_1.userService.getProfile(userId);
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
    },
    updateProfile: async (req, res, next) => {
        try {
            const authHeader = req.get('Authorization');
            const accessToken = authHeader.split(' ')[1];
            const decodedToken = await (0, utils_1.verifyAccessToken)(accessToken);
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
            const result = await user_service_1.userService.updateProfile(userId, fullName, address, dateOfBirth, about);
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
    },
    changePassword: async (req, res, next) => {
        try {
            const authHeader = req.get('Authorization');
            const accessToken = authHeader.split(' ')[1];
            const decodedToken = await (0, utils_1.verifyAccessToken)(accessToken);
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
            await user_service_1.userService.changePassword(userId, currentPassword, newPassword);
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
    },
    changeAvatar: async (req, res, next) => {
        try {
            const authHeader = req.get('Authorization');
            const accessToken = authHeader.split(' ')[1];
            const decodedToken = await (0, utils_1.verifyAccessToken)(accessToken);
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
            const avatarUrl = await user_service_1.userService.changeAvatar(userId, avatar);
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
    },
    forgetPassword: async (req, res, next) => {
        try {
            const email = req.body.email;
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                const error = new Error(errors.array()[0].msg);
                error.statusCode = 400;
                error.result = null;
                throw error;
            }
            await user_service_1.userService.forgetPassword(email);
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
    },
    resetPassword: async (req, res, next) => {
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
            await user_service_1.userService.resetPassword(newPassword, confirmPassword, token);
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
    }
};
