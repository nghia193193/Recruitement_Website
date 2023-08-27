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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshAccessToken = exports.isAuth = exports.login = exports.verifyOTP = exports.signup = void 0;
const express_validator_1 = require("express-validator");
const user_1 = require("../models/user");
const role_1 = require("../models/role");
const bcrypt = __importStar(require("bcryptjs"));
const jwt = __importStar(require("jsonwebtoken"));
const nodemailer = __importStar(require("nodemailer"));
const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
});
const secretKey = 'nghiatrongrecruitementwebsitenam42023secretkey';
const refreshKey = 'nghiatrongrecruitementwebsitenam42023refreshkey';
const signup = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const fullName = req.body.fullName;
    const email = req.body.email;
    const phone = req.body.phone;
    const password = req.body.password;
    const confirmedPassword = req.body.confirmedPassword;
    const errors = (0, express_validator_1.validationResult)(req);
    try {
        if (!errors.isEmpty()) {
            const error = new Error('Validation failed');
            error.statusCode = 422;
            error.data = errors.array();
            throw error;
        }
        const hashedPw = yield bcrypt.hash(password, 12);
        const role = yield role_1.Role.findOne({ roleName: 'Candidate', isActive: true });
        const otp = Math.floor(Math.random() * 1000000).toString();
        const user = new user_1.User({
            fullName: fullName,
            email: email,
            password: hashedPw,
            phone: phone,
            isVerifiedEmail: false,
            isActive: false,
            roleId: role ? role._id : null,
            otp: otp
        });
        yield user.save();
        let mailDetails = {
            from: 'nguyennghia193913@gmail.com',
            to: email,
            subject: 'Register Account',
            html: ` 
                Mã xác nhận đăng ký của bạn là <b>${otp}</b>
                <br>
                <h1 style="color: red">Hello</h1>
                <br>
                Vui lòng xác nhận ở đường link sau:
                http://localhost:5173/otp?email=${email}
            `
        };
        transporter.sendMail(mailDetails, err => console.log(err));
        res.status(200).json({ message: 'Đã gửi otp tới email' });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
});
exports.signup = signup;
const verifyOTP = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.body.email;
    const otp = req.body.otp;
    const errors = (0, express_validator_1.validationResult)(req);
    try {
        if (!errors.isEmpty()) {
            const error = new Error('Validation failed');
            error.statusCode = 422;
            error.data = errors.array();
            throw error;
        }
        const user = yield user_1.User.findOne({ email: email });
        if (!user) {
            const error = new Error('Email không chính xác');
            error.statusCode = 422;
            throw error;
        }
        if (user.otp !== otp) {
            const error = new Error('Mã xác nhận không chính xác');
            error.statusCode = 422;
            throw error;
        }
        user.isVerifiedEmail = true;
        yield user.save();
        res.status(200).json({ message: 'Xác thực thành công' });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
});
exports.verifyOTP = verifyOTP;
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const credentialId = req.body.credentialId;
    const password = req.body.password;
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    const errors = (0, express_validator_1.validationResult)(req);
    try {
        if (!errors.isEmpty()) {
            const error = new Error('Validation failed');
            error.statusCode = 422;
            error.data = errors.array();
            throw error;
        }
        let user;
        if (emailPattern.test(credentialId)) {
            user = yield user_1.User.findOne({ email: credentialId });
            if (!user) {
                const error = new Error('Email không chính xác');
                error.statusCode = 422;
                throw error;
            }
            if (!user.isVerifiedEmail) {
                const error = new Error('Vui lòng xác nhận email');
                error.statusCode = 422;
                throw error;
            }
        }
        else {
            user = yield user_1.User.findOne({ phone: credentialId });
            if (!user) {
                const error = new Error('Số điện thoại không chính xác');
                error.statusCode = 422;
                throw error;
            }
            if (!user.isVerifiedEmail) {
                const error = new Error('Vui lòng xác nhận email');
                error.statusCode = 422;
                throw error;
            }
        }
        const isEqual = yield bcrypt.compare(password, user.password);
        if (!isEqual) {
            const error = new Error('Mật khẩu không chính xác');
            error.statusCode = 422;
            throw error;
        }
        const payload = {
            userId: user._id,
            email: user.email,
            phone: user.phone,
            roleId: user.roleId
        };
        const accessToken = jwt.sign(payload, secretKey, { expiresIn: '1h' });
        const refreshToken = jwt.sign(payload, refreshKey, { expiresIn: '7d' });
        res.status(200).json({ accesstoken: accessToken, refreshToken: refreshToken });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
});
exports.login = login;
const isAuth = (req, res, next) => {
    const authHeader = req.get('Authorization');
    const accessToken = authHeader.split(' ')[1];
    jwt.verify(accessToken, secretKey, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid access token' });
        }
        res.status(200).json({
            userId: decoded._id,
            email: decoded.email,
            phone: decoded.phone,
            roleId: decoded.roleId
        });
    });
};
exports.isAuth = isAuth;
const refreshAccessToken = (req, res, next) => {
    const refreshToken = req.body.refreshToken;
    jwt.verify(refreshToken, refreshKey, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid refresh token' });
        }
        const newAccessToken = jwt.sign({
            userId: decoded.userId,
            email: decoded.email,
            phone: decoded.phone,
            roleId: decoded.roleId
        }, secretKey, { expiresIn: '1h' });
        res.status(200).json({ accesstoken: newAccessToken });
    });
};
exports.refreshAccessToken = refreshAccessToken;
