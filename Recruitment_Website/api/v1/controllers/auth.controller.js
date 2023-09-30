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
exports.refreshAccessToken = exports.login = exports.verifyOTP = exports.signup = void 0;
const express_validator_1 = require("express-validator");
const user_1 = require("../models/user");
const role_1 = require("../models/role");
const utils_1 = require("../utils");
const bcrypt = __importStar(require("bcryptjs"));
const jwt = __importStar(require("jsonwebtoken"));
const signup = async (req, res, next) => {
    const fullName = req.body.fullName;
    const email = req.body.email;
    const phone = req.body.phone;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    const errors = (0, express_validator_1.validationResult)(req);
    try {
        if (!errors.isEmpty()) {
            const error = new Error(errors.array()[0].msg);
            error.statusCode = 422;
            error.result = null;
            throw error;
        }
        ;
        if (confirmPassword !== password) {
            const error = new Error('Mật khẩu xác nhận không chính xác');
            error.statusCode = 401;
            throw error;
        }
        ;
        const emailUser = await user_1.User.findOne({ email: email });
        if (emailUser) {
            const error = new Error('Email đã tồn tại');
            error.statusCode = 409;
            throw error;
        }
        ;
        const phoneUser = await user_1.User.findOne({ phone: phone });
        if (phoneUser) {
            const error = new Error('Số điện thoại đã tồn tại');
            error.statusCode = 409;
            throw error;
        }
        ;
        const hashedPw = await bcrypt.hash(password, 12);
        const role = await role_1.Role.findOne({ roleName: 'CANDIDATE', isActive: true });
        let otp = '';
        for (let i = 0; i < 6; i++) {
            otp += Math.floor(Math.random() * 10);
        }
        ;
        const otpExpired = new Date(Date.now() + 10 * 60 * 1000);
        const user = new user_1.User({
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
        utils_1.transporter.sendMail(mailDetails, err => {
            const error = new Error('Gửi mail thất bại');
            throw error;
        });
        const payload = {
            userId: user._id,
            email: user.email,
            phone: user.phone
        };
        const accessToken = jwt.sign(payload, utils_1.secretKey, { expiresIn: '1h' });
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
exports.signup = signup;
const verifyOTP = async (req, res, next) => {
    const email = req.body.email;
    const otp = req.body.otp;
    const errors = (0, express_validator_1.validationResult)(req);
    try {
        if (!errors.isEmpty()) {
            const error = new Error(errors.array()[0].msg);
            error.statusCode = 422;
            error.result = null;
            throw error;
        }
        ;
        const user = await user_1.User.findOne({ email: email });
        if (!user) {
            const error = new Error('Email không chính xác');
            error.statusCode = 401;
            error.result = null;
            throw error;
        }
        ;
        if (user.otp !== otp) {
            const error = new Error('Mã xác nhận không chính xác');
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        ;
        user.isVerifiedEmail = true;
        user.otpExpired = undefined;
        await user.save();
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
    const credentialId = req.body.credentialId;
    const password = req.body.password;
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    const errors = (0, express_validator_1.validationResult)(req);
    try {
        if (!errors.isEmpty()) {
            const error = new Error(errors.array()[0].msg);
            error.statusCode = 422;
            error.result = null;
            throw error;
        }
        ;
        let user;
        if (emailPattern.test(credentialId)) {
            user = await user_1.User.findOne({ email: credentialId }).populate('roleId');
            if (!user) {
                const error = new Error('Email không chính xác');
                error.statusCode = 401;
                error.result = null;
                throw error;
            }
            ;
            if (!user.isVerifiedEmail) {
                const error = new Error('Vui lòng xác nhận email');
                error.statusCode = 401;
                error.result = null;
                throw error;
            }
            ;
        }
        else {
            user = await user_1.User.findOne({ phone: credentialId }).populate('roleId');
            if (!user) {
                const error = new Error('Số điện thoại không chính xác');
                error.statusCode = 401;
                error.result = null;
                throw error;
            }
            ;
            if (!user.isVerifiedEmail) {
                const error = new Error('Vui lòng xác nhận email');
                error.statusCode = 401;
                error.result = null;
                throw error;
            }
            ;
        }
        ;
        const isEqual = await bcrypt.compare(password, user.password);
        if (!isEqual) {
            const error = new Error('Mật khẩu không chính xác');
            error.statusCode = 401;
            error.result = null;
            throw error;
        }
        ;
        user.isActive = true;
        await user.save();
        const payload = {
            email: user.email
        };
        const accessToken = jwt.sign(payload, utils_1.secretKey, { expiresIn: '1h' });
        const refreshToken = jwt.sign(payload, utils_1.refreshKey, { expiresIn: '7d' });
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
const refreshAccessToken = (req, res, next) => {
    const refreshToken = req.body.refreshToken;
    jwt.verify(refreshToken, utils_1.refreshKey, (err, decoded) => {
        if (err) {
            return res.status(401).json({ success: false, message: 'Invalid or expired refresh token', statusCode: 401 });
        }
        ;
        const newAccessToken = jwt.sign({
            email: decoded.email
        }, utils_1.secretKey, { expiresIn: '1h' });
        res.status(200).json({
            success: true,
            message: "Làm mới token thành công",
            result: {
                accessToken: newAccessToken
            },
            statusCode: 200
        });
    });
};
exports.refreshAccessToken = refreshAccessToken;