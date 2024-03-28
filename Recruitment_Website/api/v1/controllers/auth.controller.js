"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const express_validator_1 = require("express-validator");
const utils_1 = require("../utils");
const auth_service_1 = require("../services/auth.service");
const http_errors_1 = __importDefault(require("http-errors"));
exports.authController = {
    signUp: async (req, res, next) => {
        try {
            const { fullName, email, phone, password, confirmPassword } = req.body;
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                const error = new Error(errors.array()[0].msg);
                error.statusCode = 400;
                error.result = null;
                throw error;
            }
            ;
            if (confirmPassword !== password) {
                const error = new Error('Mật khẩu xác nhận không chính xác');
                error.statusCode = 400;
                error.result = null;
                throw error;
            }
            ;
            const { accessToken } = await auth_service_1.authService.signUp(fullName, email, phone, password);
            res.status(200).json({ success: true, message: 'Sing up success!', result: accessToken, statusCode: 200 });
        }
        catch (err) {
            if (!err.statusCode) {
                err.statusCode = 500;
                err.result = null;
            }
            next(err);
        }
        ;
    },
    verifyOTP: async (req, res, next) => {
        try {
            const { email, otp } = req.body;
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                const error = new Error(errors.array()[0].msg);
                error.statusCode = 400;
                error.result = null;
                throw error;
            }
            ;
            await auth_service_1.authService.verifyOTP(email, otp);
            res.status(200).json({ success: true, message: 'Xác thực thành công', statusCode: 200 });
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
    login: async (req, res, next) => {
        try {
            const { credentialId, password } = req.body;
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                const error = new Error(errors.array()[0].msg);
                error.statusCode = 400;
                error.result = null;
                throw error;
            }
            ;
            const { accessToken, refreshToken } = await auth_service_1.authService.login(credentialId, password);
            res.status(200).json({
                success: true,
                message: "Login successful!",
                result: {
                    accessToken: accessToken,
                    refreshToken: refreshToken
                },
                statusCode: 200
            });
        }
        catch (err) {
            if (!err.statusCode) {
                err.statusCode = 500;
                err.result = null;
            }
            next(err);
        }
        ;
    },
    refreshAccessToken: async (req, res, next) => {
        try {
            const refreshToken = req.body.refreshToken;
            if (!refreshToken) {
                throw http_errors_1.default.BadRequest();
            }
            const { userId } = await (0, utils_1.verifyRefreshToken)(refreshToken);
            const accessToken = await (0, utils_1.signAccessToken)(userId);
            const rfToken = await (0, utils_1.signRefreshToken)(userId);
            res.status(200).json({
                success: true,
                message: "Làm mới token thành công",
                result: {
                    accessToken: accessToken,
                    refreshToken: rfToken
                },
                statusCode: 200
            });
        }
        catch (err) {
            if (!err.statusCode) {
                err.statusCode = 500;
                err.result = null;
            }
            next(err);
        }
    }
};
