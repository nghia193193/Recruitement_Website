"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const express_validator_1 = require("express-validator");
const sanitize_html_1 = __importDefault(require("sanitize-html"));
const middleware_1 = require("../middleware");
const router = (0, express_1.Router)();
router.get('/profile', middleware_1.isAuth, user_controller_1.userController.getProfile);
router.put('/update', middleware_1.isAuth, [
    (0, express_validator_1.body)('fullName').trim()
        .isLength({ min: 5, max: 50 }).withMessage('Độ dài của họ và tên trong khoảng 5-50 ký tự')
        .custom((value, { req }) => {
        const regex = /^[\p{L} ]+$/u; // Cho phép chữ và dấu cách
        if (!regex.test(value)) {
            throw new Error('Tên không được chứa ký tự đặc biệt trừ dấu cách');
        }
        ;
        return true;
    }),
    (0, express_validator_1.body)('address').trim()
        .isLength({ max: 200 }).withMessage('Độ dài tối đa cho phép là 200')
        .custom((value, { req }) => {
        const regex = /^[\p{L} ,\/0-9]+$/u;
        if (!regex.test(value)) {
            throw new Error('Địa chỉ không được chứa ký tự đặc biệt trừ dấu cách, ,/');
        }
        ;
        return true;
    }),
    (0, express_validator_1.body)('dateOfBirth').trim().isISO8601().toDate().withMessage('Ngày sinh không hợp lệ'),
    (0, express_validator_1.body)('about').trim()
        .isLength({ max: 200 }).withMessage('Độ dài tối đa cho phép là 500')
        .custom((value, { req }) => {
        const regex = /^[\p{L} .,\/:0-9]+$/u;
        if (!regex.test(value)) {
            throw new Error('Thông tin không được chứa ký tự đặc biệt trừ dấu cách, .,/:');
        }
        ;
        return true;
    })
], user_controller_1.userController.updateProfile);
router.put('/change-password', middleware_1.isAuth, [
    (0, express_validator_1.body)('newPassword').isLength({ min: 8, max: 32 }).withMessage('Mật khẩu mới phải có độ dài từ 8-32 ký tự')
        .customSanitizer((value, { req }) => {
        const sanitizedValue = (0, sanitize_html_1.default)(value);
        return sanitizedValue;
    }),
    (0, express_validator_1.body)('confirmNewPassword').custom((value, { req }) => {
        if (value !== req.body.newPassword) {
            throw new Error('Mật khẩu xác nhận không chính xác');
        }
        return true;
    })
], user_controller_1.userController.changePassword);
router.put('/avatar', middleware_1.isAuth, user_controller_1.userController.changeAvatar);
router.post('/forgot-password', (0, express_validator_1.body)('email').trim()
    .isEmail().withMessage('Email không hợp lệ'), user_controller_1.userController.forgetPassword);
router.post('/reset-password', [
    (0, express_validator_1.body)('newPassword').trim()
        .isLength({ min: 8, max: 32 }).withMessage('Mật khẩu có độ dài từ 8-32 ký tự')
        .customSanitizer((value, { req }) => {
        const sanitizedValue = (0, sanitize_html_1.default)(value);
        return sanitizedValue;
    }),
    (0, express_validator_1.body)('confirmPassword').trim(),
    (0, express_validator_1.body)('token').trim()
        .isLength({ min: 64, max: 64 }).withMessage('Token không hợp lệ')
        .isHexadecimal().withMessage('Token không hợp lệ')
], user_controller_1.userController.resetPassword);
exports.default = router;
