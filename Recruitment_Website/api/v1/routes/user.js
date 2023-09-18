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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController = __importStar(require("../controllers/user"));
const express_validator_1 = require("express-validator");
const sanitize_html_1 = __importDefault(require("sanitize-html"));
const router = (0, express_1.Router)();
router.get('/profile', userController.getProfile);
router.put('/update', [
    (0, express_validator_1.body)('fullName').trim()
        .isLength({ min: 5, max: 50 }).withMessage('Độ dài của họ và tên trong khoảng 5-50 ký tự'),
    (0, express_validator_1.body)('address').trim()
        .isLength({ max: 200 }).withMessage('Độ dài tối đa cho phép là 200'),
    (0, express_validator_1.body)('dateOfBirth').trim(),
    (0, express_validator_1.body)('about').trim().customSanitizer((value, { req }) => {
        const sanitizedValue = (0, sanitize_html_1.default)(value);
        return sanitizedValue;
    })
], userController.updateProfile);
router.put('/change-password', [
    (0, express_validator_1.body)('newPassword').isLength({ min: 8, max: 32 }).withMessage('Mật khẩu mới phải có độ dài từ 8-32 ký tự'),
    (0, express_validator_1.body)('confirmNewPassword').custom((value, { req }) => {
        if (value !== req.body.newPassword) {
            throw new Error('Mật khẩu xác nhận không chính xác');
        }
        return true;
    })
], userController.changePassword);
// router.put('/avatar', )
exports.default = router;
