import { Router } from 'express';
import { body } from 'express-validator';
import { authController } from '../controllers/auth.controller';
import sanitizeHtml from 'sanitize-html';

const router = Router();

router.post('/register', [
    body('fullName').trim()
        .isLength({ min: 5, max: 50 }).withMessage('Độ dài của họ và tên trong khoảng 5-50 ký tự')
        .custom((value: string) => {
            const regex = /^[\p{L} ]+$/u; // Cho phép chữ, số và dấu cách
            if (!regex.test(value)) {
                throw new Error('Tên không được chứa ký tự đặc biệt trừ dấu cách');
            };
            return true;
        }),
    body('email').trim()
        .isEmail().withMessage('Email không hợp lệ'),
    body('phone').trim()
        .custom((value: string) => {
            // Định dạng số điện thoại của Việt Nam
            const phonePattern = /^(0[2-9]|1[0-9]|2[0-8]|3[2-9]|5[6|8|9]|7[0|6-9]|8[1-5])[0-9]{8}$/;
            if (!phonePattern.test(value)) {
                throw new Error('Số điện thoại không hợp lệ');
            }
            return true;
        }),
    body('password').trim()
        .isLength({ min: 8, max: 32 }).withMessage('Mật khẩu có độ dài từ 8-32 ký tự')
        .customSanitizer((value: string) => {
            const sanitizedValue = sanitizeHtml(value);
            return sanitizedValue;
        }),
    body('confirmPassword').trim()
        .notEmpty().withMessage('Vui lòng xác nhận mật khẩu')
], authController.signUp);

router.post('/verifyOTP', [
    body('email').trim()
        .isEmail().withMessage('Email không hợp lệ'),
    body('otp').trim()
        .isLength({ min: 6, max: 6 }).withMessage('Mã OTP gồm 6 số')
        .custom((value: string) => {
            const regex = /^[0-9]+$/; // Chỉ cho phép số
            if (!regex.test(value)) {
                throw new Error('Mã OTP gồm 6 số');
            };
            return true;
        })
], authController.verifyOTP);

router.post('/login', [
    body('credentialId').trim()
        .custom((value: string) => {
            const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
            const phonePattern = /^(0[2-9]|1[0-9]|2[0-8]|3[2-9]|5[6|8|9]|7[0|6-9]|8[1-5])[0-9]{8}$/;
            if (!emailPattern.test(value) && !phonePattern.test(value)) {
                throw new Error('Email hoặc số điện thoại không hợp lệ');
            }
            return true;
        }),
    body('password').trim()
        .notEmpty().withMessage('Vui lòng nhập mật khẩu'),
], authController.login);

router.post('/refresh-access-token', authController.refreshAccessToken);

export default router;