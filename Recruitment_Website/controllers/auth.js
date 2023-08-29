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
        if (confirmPassword !== password) {
            const error = new Error('Mật khẩu xác nhận không chính xác');
            error.statusCode = 401;
            throw error;
        }
        const emailUser = await user_1.User.findOne({ email: email });
        if (emailUser) {
            const error = new Error('Email đã tồn tại');
            error.statusCode = 409;
            throw error;
        }
        const phoneUser = await user_1.User.findOne({ phone: phone });
        if (phoneUser) {
            const error = new Error('Số điện thoại đã tồn tại');
            error.statusCode = 409;
            throw error;
        }
        const hashedPw = await bcrypt.hash(password, 12);
        const role = await role_1.Role.findOne({ roleName: 'CANDIDATE', isActive: true });
        const otp = Math.floor(Math.random() * 1000000).toString();
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
                Mã xác nhận đăng ký của bạn là <b>${otp}</b>
                <br>
                <h3 style="color: red">Vui lòng xác nhận trong vòng 10 phút</h3>
                <br>
                Vui lòng xác nhận ở đường link sau:
                http://localhost:5173/otp?email=${email}
            `
        };
        transporter.sendMail(mailDetails, err => console.log(err));
        const payload = {
            userId: user._id,
            email: user.email,
            phone: user.phone
        };
        const accessToken = jwt.sign(payload, secretKey, { expiresIn: '1h' });
        res.status(200).json({ success: true, message: 'Sing up success!', result: accessToken, statusCode: 200 });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        next(err);
    }
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
        const user = await user_1.User.findOne({ email: email });
        if (!user) {
            const error = new Error('Email không chính xác');
            error.statusCode = 401;
            error.result = null;
            throw error;
        }
        if (user.otp !== otp) {
            const error = new Error('Mã xác nhận không chính xác');
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
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
        next(err);
    }
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
        let user;
        if (emailPattern.test(credentialId)) {
            user = await user_1.User.findOne({ email: credentialId }).populate('roleId');
            if (!user) {
                const error = new Error('Email không chính xác');
                error.statusCode = 401;
                error.result = null;
                throw error;
            }
            if (!user.isVerifiedEmail) {
                const error = new Error('Vui lòng xác nhận email');
                error.statusCode = 401;
                error.result = null;
                throw error;
            }
        }
        else {
            user = await user_1.User.findOne({ phone: credentialId }).populate('roleId');
            if (!user) {
                const error = new Error('Số điện thoại không chính xác');
                error.statusCode = 401;
                error.result = null;
                throw error;
            }
            if (!user.isVerifiedEmail) {
                const error = new Error('Vui lòng xác nhận email');
                error.statusCode = 401;
                error.result = null;
                throw error;
            }
        }
        console.log(user);
        const isEqual = await bcrypt.compare(password, user.password);
        if (!isEqual) {
            const error = new Error('Mật khẩu không chính xác');
            error.statusCode = 401;
            error.result = null;
            throw error;
        }
        user.isActive = true;
        await user.save();
        const payload = {
            userId: user._id,
            fullName: user.fullName,
            email: user.email,
            phone: user.phone,
            avatar: user.avatar ? user.avatar : null,
            gender: user.gender ? user.gender : null,
            address: user.address ? user.address : null,
            dateOfBirth: user.dateOfBirth ? user.dateOfBirth : null,
            active: true,
            role: user.get('roleId.roleName'),
            createAt: user.createdAt,
            updateAt: user.updatedAt ? user.updatedAt : null
        };
        const accessToken = jwt.sign(payload, secretKey, { expiresIn: '1h' });
        const refreshToken = jwt.sign(payload, refreshKey, { expiresIn: '7d' });
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
};
exports.login = login;
const isAuth = (req, res, next) => {
    const authHeader = req.get('Authorization');
    const accessToken = authHeader.split(' ')[1];
    jwt.verify(accessToken, secretKey, (err, decoded) => {
        if (err) {
            return res.status(401).json({ success: false, message: 'Invalid access token', statusCode: 401 });
        }
        res.status(200).json({
            success: true,
            message: "Lấy dữ liệu thành công",
            result: {
                userId: decoded.userId,
                fullName: decoded.fullName,
                email: decoded.email,
                phone: decoded.phone,
                avatar: decoded.avatar,
                gender: decoded.gender,
                address: decoded.address,
                dateOfBirth: decoded.dateOfBirth,
                active: decoded.active,
                role: decoded.role,
                createAt: decoded.createAt,
                updateAt: decoded.updateAt
            },
            statusCode: 200
        });
    });
};
exports.isAuth = isAuth;
const refreshAccessToken = (req, res, next) => {
    const refreshToken = req.body.refreshToken;
    jwt.verify(refreshToken, refreshKey, (err, decoded) => {
        if (err) {
            return res.status(401).json({ success: false, message: 'Invalid refresh token', statusCode: 401 });
        }
        const newAccessToken = jwt.sign({
            userId: decoded.userId,
            fullName: decoded.fullName,
            email: decoded.email,
            phone: decoded.phone,
            avatar: decoded.avatar,
            gender: decoded.gender,
            address: decoded.address,
            dateOfBirth: decoded.dateOfBirth,
            active: decoded.active,
            role: decoded.role,
            createAt: decoded.createAt,
            updateAt: decoded.updateAt
        }, secretKey, { expiresIn: '1h' });
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
