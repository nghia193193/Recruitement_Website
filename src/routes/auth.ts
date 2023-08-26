import { Router } from 'express';
import { body } from 'express-validator';
import * as authController from '../controllers/auth';
import { User } from '../models/user';

const router = Router();

router.post('/user',[
    body('fullName').trim()
        .isLength({min: 5}).withMessage('Độ dài tối thiểu của họ và tên là 5'),
    body('email').trim()
        .isEmail().withMessage('Email không hợp lệ')
        .custom((value: string, {req}) => {
            return User.findOne({email: value}).then(user => {
                if (user) {
                    return Promise.reject('Email đã tồn tại')
                }
            })
        })
        .normalizeEmail(),
    body('phone').trim()
        .custom((value: string, {req}) => {
            // Định dạng số điện thoại của Việt Nam: 0xxx, +84xxx, 84xxx
            const phoneNumberRegex = /^(0|\+?84)(3[2-9]|5[2689]|7[0|6-9]|8[1-9]|9[0-9])[0-9]{7}$/;
            if (!phoneNumberRegex.test(value)) {
                throw new Error('Số điện thoại không hợp lệ');
            }
            return User.findOne({phone: value}).then(user => {
                if (user) {
                    return Promise.reject('Số điện thoại đã tồn tại');
                }
            })
        }),
    body('password').trim()
        .isLength({min: 8}).withMessage('Mật khẩu có độ dài tối thiểu là 8'),
    body('confirmedPassword').trim()
        .custom((value: string, {req}) => {
            if (value !== req.body.password) {
                throw new Error('Mật khẩu xác nhận không chính xác');
            }
            return true
        })
], authController.signup);

router.post('/auth/sendOTP',[
    body('email').trim()
        .isEmail().withMessage('Email không hợp lệ')
        .normalizeEmail(),
], authController.sendOTP);

router.post('/auth/verifyOTP',[
    body('email').trim()
        .isEmail().withMessage('Email không hợp lệ')
        .normalizeEmail(),
    body('otp').trim()
        .isLength({min: 6, max: 6}).withMessage('Mã OTP chỉ gồm 6 ký tự')
], authController.verifyOTP);

export default router;