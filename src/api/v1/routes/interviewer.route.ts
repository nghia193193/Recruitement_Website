import { Router } from "express";
import * as interviewerController from '../controllers/interviewer.controller';
import { isAuth } from '../middleware';
import { body, param, query } from "express-validator";
import { questionType } from "../utils";
import { Skill } from "../models/skill";

const router = Router();

router.put('/information', isAuth, [

], interviewerController.saveInformation);

router.get('/information', isAuth, [

], interviewerController.getInformation);

router.post('/interview-questions', isAuth, [
    body('content').trim()
        .notEmpty().withMessage('Vui lòng nhập nội dung câu hỏi')
        .custom((value: string) => {
            const regex = /^[\p{L} ,.?()\/0-9]+$/u;
            if (!regex.test(value)) {
                throw new Error('Nội dung không được chứa ký tự đặc biệt trừ (dấu cách ,.?()/:)');
            };
            return true;
        }),
    body('type').trim()
        .notEmpty().withMessage('Vui lòng chọn loại câu hỏi')
        .custom((value: string) => {
            if (!questionType.includes(value)) {
                throw new Error('Loại câu hỏi không hợp lệ');
            }
            return true
        }),
    body('skill').trim()
        .notEmpty().withMessage('Vui lòng chọn loại câu hỏi')
        .custom( async (value) => {
            const skill = await Skill.findOne({ name: value });
            if (!skill) {
                throw new Error(`Skill: '${value}' không hợp lệ`);
            }
            return true;
        })
], interviewerController.createQuestion);

router.get('/question', isAuth, [
    query('skill').trim()
        .custom( async (value, {req}) => {
            if (value) {
                const skill = await Skill.findOne({ name: value });
                if (!skill) {
                    throw new Error(`Skill: '${value}' không hợp lệ`);
                }
            }
            return true;
        }),
    query('type').trim()
        .custom((value: string) => {
            if(value) {
                if (!questionType.includes(value)) {
                    throw new Error('Loại câu hỏi không hợp lệ');
                }
                return true
            }
            return true;
        }),
    query('page').trim()
        .custom((value, {req}) => {
            if (value) {
                const regex = /^[0-9]+$/; // Chỉ cho phép số
                if (!regex.test(value)) {
                    throw new Error('page không hợp lệ');
                };
                const intValue = parseInt(value, 10);
                if (isNaN(intValue) || intValue <= 0) {
                    throw new Error('page phải là số nguyên lớn hơn 0');
                }
                return true;
            }
            return true;
        }),
    query('limit').trim()
        .custom((value, {req}) => {
            if (value) {
                const regex = /^[0-9]+$/; // Chỉ cho phép số
                if (!regex.test(value)) {
                    throw new Error('limit không hợp lệ');
                };
                const intValue = parseInt(value, 10);
                if (isNaN(intValue) || intValue <= 0) {
                    throw new Error('limit phải là số nguyên lớn hơn 0');
                }
                return true;
            }
            return true;
        }),
], interviewerController.getAllQuestions);

export default router;