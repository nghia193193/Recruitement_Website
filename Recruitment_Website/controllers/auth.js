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
exports.verifyOTP = exports.sendOTP = exports.signup = void 0;
const express_validator_1 = require("express-validator");
const user_1 = require("../models/user");
const role_1 = require("../models/role");
const bcrypt = __importStar(require("bcryptjs"));
const nodemailer = __importStar(require("nodemailer"));
const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
        user: 'nguyennghia193913@gmail.com',
        pass: 'rtasipfgjrhvcwdj'
    }
});
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
        const user = new user_1.User({
            fullName: fullName,
            email: email,
            password: hashedPw,
            phone: phone,
            isVerifiedEmail: false,
            isActive: false,
            roleId: role ? role._id : null
        });
        yield user.save();
        res.status(200).json({ email: email });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
});
exports.signup = signup;
const sendOTP = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.body.email;
    const errors = (0, express_validator_1.validationResult)(req);
    try {
        if (!errors.isEmpty()) {
            const error = new Error('Validation failed');
            error.statusCode = 422;
            error.data = errors.array();
            throw error;
        }
        const otp = Math.floor(Math.random() * 1000000).toString();
        const user = yield user_1.User.findOne({ email: email });
        if (!user) {
            const error = new Error('Email không chính xác');
            error.statusCode = 422;
            throw error;
        }
        user.otp = otp;
        yield user.save();
        let mailDetails = {
            from: 'nguyennghia193913@gmail.com',
            to: email,
            subject: 'Register Account',
            html: ` Mã xác nhận đăng ký của bạn là <b>${otp}</b> `
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
exports.sendOTP = sendOTP;
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
