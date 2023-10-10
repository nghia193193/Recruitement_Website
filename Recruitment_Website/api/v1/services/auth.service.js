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
exports.SignUp = void 0;
const user_1 = require("../models/user");
const role_1 = require("../models/role");
const bcrypt = __importStar(require("bcryptjs"));
const jwt = __importStar(require("jsonwebtoken"));
const utils_1 = require("../utils");
const SignUp = async (req, res, next) => {
    const { fullName, email, phone, password, confirmPassword } = req.body;
    if (confirmPassword !== password) {
        const error = new Error('Mật khẩu xác nhận không chính xác');
        error.statusCode = 400;
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
    return accessToken;
};
exports.SignUp = SignUp;
