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
exports.refreshAccessToken = exports.login = exports.verifyOTP = exports.signUp = void 0;
const express_validator_1 = require("express-validator");
const utils_1 = require("../utils");
const authService = __importStar(require("../services/auth.service"));
const signUp = async (req, res, next) => {
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
        const { accessToken } = await authService.signUp(fullName, email, phone, password);
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
};
exports.signUp = signUp;
const verifyOTP = async (req, res, next) => {
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
        await authService.verifyOTP(email, otp);
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
};
exports.verifyOTP = verifyOTP;
const login = async (req, res, next) => {
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
        const { accessToken, refreshToken } = await authService.login(credentialId, password);
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
};
exports.login = login;
const refreshAccessToken = async (req, res, next) => {
    try {
        const refreshToken = req.body.refreshToken;
        const decodedToken = await (0, utils_1.verifyRefreshToken)(refreshToken);
        const userId = decodedToken.userId;
        const { newAccessToken } = await authService.refreshAccessToken(userId);
        res.status(200).json({
            success: true,
            message: "Làm mới token thành công",
            result: {
                accessToken: newAccessToken
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
};
exports.refreshAccessToken = refreshAccessToken;
