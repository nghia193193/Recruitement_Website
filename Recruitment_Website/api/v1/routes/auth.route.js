"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const auth_controller_1 = require("../controllers/auth.controller");
const sanitize_html_1 = __importDefault(require("sanitize-html"));
const router = (0, express_1.Router)();
router.post('/register', [
    (0, express_validator_1.body)('fullName').trim()
        .isLength({ min: 5, max: 50 }).withMessage('Độ dài của họ và tên trong khoảng 5-50 ký tự')
        .custom((value) => {
        const regex = /^[\p{L} ]+$/u; // Cho phép chữ, số và dấu cách
        if (!regex.test(value)) {
            throw new Error('Tên không được chứa ký tự đặc biệt trừ dấu cách');
        }
        ;
        return true;
    }),
    (0, express_validator_1.body)('email').trim()
        .isEmail().withMessage('Email không hợp lệ'),
    (0, express_validator_1.body)('phone').trim()
        .custom((value) => {
        // Định dạng số điện thoại của Việt Nam
        const phonePattern = /^(0[2-9]|1[0-9]|2[0-8]|3[2-9]|5[6|8|9]|7[0|6-9]|8[1-5])[0-9]{8}$/;
        if (!phonePattern.test(value)) {
            throw new Error('Số điện thoại không hợp lệ');
        }
        return true;
    }),
    (0, express_validator_1.body)('password').trim()
        .isLength({ min: 8, max: 32 }).withMessage('Mật khẩu có độ dài từ 8-32 ký tự')
        .customSanitizer((value) => {
        const sanitizedValue = (0, sanitize_html_1.default)(value);
        return sanitizedValue;
    }),
    (0, express_validator_1.body)('confirmPassword').trim()
        .notEmpty().withMessage('Vui lòng xác nhận mật khẩu')
], auth_controller_1.authController.signUp);
router.post('/verifyOTP', [
    (0, express_validator_1.body)('email').trim()
        .isEmail().withMessage('Email không hợp lệ'),
    (0, express_validator_1.body)('otp').trim()
        .isLength({ min: 6, max: 6 }).withMessage('Mã OTP gồm 6 số')
        .custom((value) => {
        const regex = /^[0-9]+$/; // Chỉ cho phép số
        if (!regex.test(value)) {
            throw new Error('Mã OTP gồm 6 số');
        }
        ;
        return true;
    })
], auth_controller_1.authController.verifyOTP);
router.post('/login', [
    (0, express_validator_1.body)('credentialId').trim()
        .custom((value) => {
        const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
        const phonePattern = /^(0[2-9]|1[0-9]|2[0-8]|3[2-9]|5[6|8|9]|7[0|6-9]|8[1-5])[0-9]{8}$/;
        if (!emailPattern.test(value) && !phonePattern.test(value)) {
            throw new Error('Email hoặc số điện thoại không hợp lệ');
        }
        return true;
    }),
    (0, express_validator_1.body)('password').trim()
        .notEmpty().withMessage('Vui lòng nhập mật khẩu'),
], auth_controller_1.authController.login);
router.post('/refresh-access-token', auth_controller_1.authController.refreshAccessToken);
exports.default = router;
