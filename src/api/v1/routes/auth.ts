import { Router } from 'express';
import { body } from 'express-validator';
import * as authController from '../controllers/auth';
import { User } from '../models/user';

const router = Router();

router.post('/auth/register',[
    body('fullName').trim()
        .isLength({min: 5, max:50}).withMessage('Độ dài của họ và tên trong khoảng 5-50 ký tự'),
    body('email').trim()
        .isEmail().withMessage('Email không hợp lệ')
        .normalizeEmail(),
    body('phone').trim()
        .custom((value: string, {req}) => {
            // Định dạng số điện thoại của Việt Nam
            const phonePattern = /^(0[2-9]|1[0-9]|2[0-8]|3[2-9]|5[6|8|9]|7[0|6-9]|8[1-5])[0-9]{8}$/;
            if (!phonePattern.test(value)) {
                throw new Error('Số điện thoại không hợp lệ');
            }
            return true;
        }),
    body('password').trim()
        .isLength({min: 8, max: 32}).withMessage('Mật khẩu có độ dài từ 8-32 ký tự'),
    body('confirmPassword').trim()
        .notEmpty().withMessage('Vui lòng xác nhận mật khẩu')
], authController.signup);

router.post('/auth/verifyOTP',[
    body('email').trim()
        .isEmail().withMessage('Email không hợp lệ')
        .normalizeEmail(),
    body('otp').trim()
        .isLength({min: 6, max: 6}).withMessage('Mã OTP chỉ gồm 6 ký tự')
], authController.verifyOTP);

router.post('/auth/login',[
    body('credentialId').trim()
        .custom((value: string, {req}) => {
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

router.get('/user/profile', authController.isAuth);

router.post('/auth/refresh-access-token', authController.refreshAccessToken);

export default router;