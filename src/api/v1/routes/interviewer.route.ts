import { Router } from "express";
import * as interviewerController from '../controllers/interviewer.controller';
import { isAuth } from '../middleware';
import { body, param, query } from "express-validator";
import { questionType } from "../utils";
import { Skill } from "../models/skill";
import { QuestionCandidate } from "../models/questionCandidate";

const router = Router();

router.put('/information', isAuth, [

], interviewerController.saveInformation);

router.get('/information', isAuth, interviewerController.getInformation);

router.post('/interview-questions', isAuth, [
    body('content').trim()
        .notEmpty().withMessage('Vui lòng nhập nội dung câu hỏi')
        .custom((value: string) => {
            const regex = /^[\p{L} ,.?()%\/:0-9]+$/u;
            if (!regex.test(value)) {
                throw new Error('Nội dung không được chứa ký tự đặc biệt trừ (dấu cách ,.?()%/:)');
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
        }),
    body('note').trim()
        .custom((value: string) => {
            if (value) {
                const regex = /^[\p{L} ,.?()%\/:0-9]+$/u;
                if (!regex.test(value)) {
                    throw new Error('Ghi chú không được chứa ký tự đặc biệt trừ (dấu cách ,.?()%/:)');
                };
                return true;
            }
            return true;
        }),
], interviewerController.createQuestion);

router.get('/candidates', isAuth, [
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
], interviewerController.getAllApplicants);

router.get('/candidates/:candidateId', isAuth, [
    param('candidateId').trim().isMongoId().withMessage('candidateId không hợp lệ')
], interviewerController.getSingleApplicant);

router.get('/interviews', isAuth, [
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
], interviewerController.getAllInterviews)

router.get('/interviews/:interviewId', isAuth, [
    param('interviewId').trim().isMongoId().withMessage('interviewId không hợp lệ')
], interviewerController.getSingleInterview);

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
    query('content').trim()
        .custom((value) => {
            if (value) {
                const regex = /^[\p{L} ,.?()\/:0-9]+$/u;
                if (!regex.test(value)) {
                    throw new Error('Nội dung không được chứa ký tự đặc biệt trừ (dấu cách ,.?()/:)');
                };
                return true;
            }
            return true;
        })
], interviewerController.getAllQuestions);

router.get('/interview-questions/:questionId', isAuth, [
    param('questionId').trim().isMongoId().withMessage('questionId không hợp lệ')
], interviewerController.getSingleQuestion);

router.put('/interview-questions/:questionId', isAuth, [
    param('questionId').trim().isMongoId().withMessage('questionId không hợp lệ'),
    body('content').trim()
        .notEmpty().withMessage('Vui lòng nhập nội dung câu hỏi')
        .custom((value: string) => {
            const regex = /^[\p{L} ,.?()\/:0-9]+$/u;
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
        }),
    body('note').trim()
        .custom((value: string) => {
            if (value) {
                const regex = /^[\p{L} ,.?()%\/:0-9]+$/u;
                if (!regex.test(value)) {
                    throw new Error('Ghi chú không được chứa ký tự đặc biệt trừ (dấu cách ,.?()%/:)');
                };
                return true;
            }
            return true;
        }),
], interviewerController.updateQuestion);

router.delete('/interview-questions/:questionId', isAuth, [
    param('questionId').trim().isMongoId().withMessage('questionId không hợp lệ')
], interviewerController.deleteQuestion);

router.get('/skills', isAuth, interviewerController.getSkillQuestion);
router.get('/type', isAuth, interviewerController.getTypeQuestion);

router.get('/interview/:interviewId/questions', isAuth, [
    param('interviewId').trim().isMongoId().withMessage('interviewId không hợp lệ')
], interviewerController.getAssignQuestions);

router.post('/interview/:interviewId/questions', isAuth, [
    param('interviewId').trim().isMongoId().withMessage('interviewId không hợp lệ'),
    body('questions').custom( async (value, {req}) => {
        for (let i=0; i<value.length; i++) {
            const questionCandidate = await QuestionCandidate.findOne({
                interviewId: (req.params as any).interviewId, 'questions.questionId': value[i].questionId});
            if (questionCandidate) {
                throw new Error(`QuestionId: '${value[i].questionId}' đã tồn tại`);
            }
            const regex = /^[\p{L} ,.?()\/:0-9]+$/u;
            if (value[i].note) {
                if (!regex.test(value[i].note)) {
                    throw new Error('Note không được chứa ký tự đặc biệt trừ (dấu cách ,.?()/:)');
                }
            }
            if (value[i].score) {
                const regex = /^[0-9]+$/;
                if (!regex.test(value[i].score)) {
                    throw new Error(`score không hợp lệ`);
                };
                const intValue = parseInt(value[i].score, 10);
                if (isNaN(intValue) || intValue > 10) {
                    throw new Error('page phải là số nguyên <= 10');
                }
            }
        }
        return true;
    })
], interviewerController.assignQuestions);

router.put('/interview/:interviewId/questions', isAuth, [
    param('interviewId').trim().isMongoId().withMessage('interviewId không hợp lệ'),
    body('questions').custom( async (value, {req}) => {
        for (let i=0; i<value.length; i++) {
            const questionCandidate = await QuestionCandidate.findOne({
                interviewId: (req.params as any).interviewId, 'questions.questionId': value[i].questionId});
            if (!questionCandidate) {
                throw new Error(`QuestionId: '${value[i].questionId}' không tồn tại`);
            }
            const regex = /^[\p{L} ,.?()\/:0-9]+$/u;
            if (!regex.test(value[i].content)) {
                throw new Error('Nội dung không được chứa ký tự đặc biệt trừ (dấu cách ,.?()/:)');
            }
            if (!questionType.includes(value[i].typeQuestion)) {
                throw new Error(`typeQuestion: ${value[i].typeQuestion} không hợp lệ`);
            }
            const skill = await Skill.findOne({name: value[i].skill});
            if (!skill) {
                throw new Error(`skill: ${value[i].skill} không hợp lệ`);
            }
            if (value[i].note) {
                if (!regex.test(value[i].note)) {
                    throw new Error('Note không được chứa ký tự đặc biệt trừ (dấu cách ,.?()/:)');
                }
            }
            if (value[i].score) {
                const regex = /^[0-9]+$/;
                if (!regex.test(value[i].score)) {
                    console.log(value[i].score);
                    throw new Error(`score không hợp lệ`);
                };
                const intValue = parseInt(value[i].score, 10);
                if (isNaN(intValue) || intValue > 10) {
                    throw new Error('page phải là số nguyên <= 10');
                }
            }
        }
        return true;
    })
], interviewerController.updateQuestions);

router.delete('/interview/:interviewId/questions/:questionId', isAuth, [
    param('interviewId').trim().isMongoId().withMessage('interviewId không hợp lệ'),
    param('questionId').trim().isMongoId().withMessage('questionId không hợp lệ')
], interviewerController.deleteAssignQuestion);

router.put('/interview/:interviewId/totalScore', isAuth, [
    param('interviewId').trim().isMongoId().withMessage('interviewId không hợp lệ'),
], interviewerController.submitTotalScore);

export default router;