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
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const authController = __importStar(require("../controllers/auth"));
const user_1 = require("../models/user");
const router = (0, express_1.Router)();
router.post('/user', [
    (0, express_validator_1.body)('fullName').trim()
        .isLength({ min: 5 }).withMessage('Độ dài tối thiểu của họ và tên là 5'),
    (0, express_validator_1.body)('email').trim()
        .isEmail().withMessage('Email không hợp lệ')
        .custom((value, { req }) => {
        return user_1.User.findOne({ email: value }).then(user => {
            if (user) {
                return Promise.reject('Email đã tồn tại');
            }
        });
    })
        .normalizeEmail(),
    (0, express_validator_1.body)('phone').trim()
        .custom((value, { req }) => {
        // Định dạng số điện thoại của Việt Nam: 0xxx, +84xxx, 84xxx
        const phoneNumberRegex = /^(0|\+?84)(3[2-9]|5[2689]|7[0|6-9]|8[1-9]|9[0-9])[0-9]{7}$/;
        if (!phoneNumberRegex.test(value)) {
            throw new Error('Số điện thoại không hợp lệ');
        }
        return user_1.User.findOne({ phone: value }).then(user => {
            if (user) {
                return Promise.reject('Số điện thoại đã tồn tại');
            }
        });
    }),
    (0, express_validator_1.body)('password').trim()
        .isLength({ min: 8 }).withMessage('Mật khẩu có độ dài tối thiểu là 8'),
    (0, express_validator_1.body)('confirmedPassword').trim()
        .custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Mật khẩu xác nhận không chính xác');
        }
        return true;
    })
], authController.signup);
router.post('/auth/sendOTP', [
    (0, express_validator_1.body)('email').trim()
        .isEmail().withMessage('Email không hợp lệ')
        .normalizeEmail(),
], authController.sendOTP);
router.post('/auth/verifyOTP', [
    (0, express_validator_1.body)('email').trim()
        .isEmail().withMessage('Email không hợp lệ')
        .normalizeEmail(),
    (0, express_validator_1.body)('otp').trim()
        .isLength({ min: 6, max: 6 }).withMessage('Mã OTP chỉ gồm 6 ký tự')
], authController.verifyOTP);
exports.default = router;
