import { Router } from "express";
import * as userController from '../controllers/user.controller';
import { body } from "express-validator";
import sanitizeHtml from 'sanitize-html';
import { isAuth } from '../middleware';
const router = Router();

router.get('/profile',isAuth, userController.GetProfile);
router.put('/update',isAuth ,[
    body('fullName').trim()
        .isLength({min: 5, max:50}).withMessage('Độ dài của họ và tên trong khoảng 5-50 ký tự')
        .custom((value: string, {req}) => {
            const regex = /^[\p{L} ]+$/u; // Cho phép chữ và dấu cách
            if (!regex.test(value)) {
                throw new Error('Tên không được chứa ký tự đặc biệt trừ dấu cách');
            };
            return true;
        }),
    body('address').trim()
        .isLength({max: 200}).withMessage('Độ dài tối đa cho phép là 200')
        .custom((value: string, {req}) => {
            const regex = /^[\p{L} ,\/0-9]+$/u; 
            if (!regex.test(value)) {
                throw new Error('Địa chỉ không được chứa ký tự đặc biệt trừ dấu cách, ,/');
            };
            return true;
        }),
    body('dateOfBirth').trim().isISO8601().toDate().withMessage('Ngày sinh không hợp lệ'),
    body('about').trim()
        .isLength({max: 200}).withMessage('Độ dài tối đa cho phép là 500')
        .custom((value: string, {req}) => {
            const regex = /^[\p{L} .,\/:0-9]+$/u;
            if (!regex.test(value)) {
                throw new Error('Thông tin không được chứa ký tự đặc biệt trừ dấu cách, .,/:');
            };
            return true;
        })
], userController.UpdateProfile);

router.put('/change-password',isAuth, [
    body('newPassword').isLength({min: 8, max: 32}).withMessage('Mật khẩu mới phải có độ dài từ 8-32 ký tự')
        .customSanitizer((value: string, {req}) => {
            const sanitizedValue = sanitizeHtml(value);
            return sanitizedValue;
        }),
    body('confirmNewPassword').custom((value: string, {req}) => {
        if (value !== req.body.newPassword) {
            throw new Error('Mật khẩu xác nhận không chính xác');
        }
        return true;
    })
]
,userController.ChangePassword);

router.put('/avatar',isAuth, userController.ChangeAvatar);

router.post('/forgot-password',
    body('email').trim()
        .isEmail().withMessage('Email không hợp lệ')
, userController.ForgotPassword);

router.post('/reset-password',[
    body('newPassword').trim()
        .isLength({min: 8, max: 32}).withMessage('Mật khẩu có độ dài từ 8-32 ký tự')
        .customSanitizer((value: string, {req}) => {
            const sanitizedValue = sanitizeHtml(value);
            return sanitizedValue;
        }),
    body('confirmPassword').trim(),
    body('token').trim()
        .isLength({min: 64, max: 64}).withMessage('Token không hợp lệ')
        .isHexadecimal().withMessage('Token không hợp lệ')
], userController.ResetPassword)

export default router;