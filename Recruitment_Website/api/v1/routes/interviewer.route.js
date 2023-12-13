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
const interviewerController = __importStar(require("../controllers/interviewer.controller"));
const middleware_1 = require("../middleware");
const express_validator_1 = require("express-validator");
const utils_1 = require("../utils");
const skill_1 = require("../models/skill");
const questionCandidate_1 = require("../models/questionCandidate");
const router = (0, express_1.Router)();
router.put('/information', middleware_1.isAuth, [], interviewerController.saveInformation);
router.get('/information', middleware_1.isAuth, interviewerController.getInformation);
router.post('/interview-questions', middleware_1.isAuth, [
    (0, express_validator_1.body)('content').trim()
        .notEmpty().withMessage('Vui lòng nhập nội dung câu hỏi')
        .custom((value) => {
        const regex = /^[\p{L} ,.?()%\/:0-9]+$/u;
        if (!regex.test(value)) {
            throw new Error('Nội dung không được chứa ký tự đặc biệt trừ (dấu cách ,.?()%/:)');
        }
        ;
        return true;
    }),
    (0, express_validator_1.body)('type').trim()
        .notEmpty().withMessage('Vui lòng chọn loại câu hỏi')
        .custom((value) => {
        if (!utils_1.questionType.includes(value)) {
            throw new Error('Loại câu hỏi không hợp lệ');
        }
        return true;
    }),
    (0, express_validator_1.body)('skill').trim()
        .notEmpty().withMessage('Vui lòng chọn loại câu hỏi')
        .custom(async (value) => {
        const skill = await skill_1.Skill.findOne({ name: value });
        if (!skill) {
            throw new Error(`Skill: '${value}' không hợp lệ`);
        }
        return true;
    }),
    (0, express_validator_1.body)('note').trim()
        .custom((value) => {
        if (value) {
            const regex = /^[\p{L} ,.?()%\/:0-9]+$/u;
            if (!regex.test(value)) {
                throw new Error('Ghi chú không được chứa ký tự đặc biệt trừ (dấu cách ,.?()%/:)');
            }
            ;
            return true;
        }
        return true;
    }),
], interviewerController.createQuestion);
router.get('/candidates', middleware_1.isAuth, [
    (0, express_validator_1.query)('page').trim()
        .custom((value, { req }) => {
        if (value) {
            const regex = /^[0-9]+$/; // Chỉ cho phép số
            if (!regex.test(value)) {
                throw new Error('page không hợp lệ');
            }
            ;
            const intValue = parseInt(value, 10);
            if (isNaN(intValue) || intValue <= 0) {
                throw new Error('page phải là số nguyên lớn hơn 0');
            }
            return true;
        }
        return true;
    }),
    (0, express_validator_1.query)('limit').trim()
        .custom((value, { req }) => {
        if (value) {
            const regex = /^[0-9]+$/; // Chỉ cho phép số
            if (!regex.test(value)) {
                throw new Error('limit không hợp lệ');
            }
            ;
            const intValue = parseInt(value, 10);
            if (isNaN(intValue) || intValue <= 0) {
                throw new Error('limit phải là số nguyên lớn hơn 0');
            }
            return true;
        }
        return true;
    }),
], interviewerController.getAllApplicants);
router.get('/candidates/:candidateId', middleware_1.isAuth, [
    (0, express_validator_1.param)('candidateId').trim().isMongoId().withMessage('candidateId không hợp lệ')
], interviewerController.getSingleApplicant);
router.get('/interviews', middleware_1.isAuth, [
    (0, express_validator_1.query)('page').trim()
        .custom((value, { req }) => {
        if (value) {
            const regex = /^[0-9]+$/; // Chỉ cho phép số
            if (!regex.test(value)) {
                throw new Error('page không hợp lệ');
            }
            ;
            const intValue = parseInt(value, 10);
            if (isNaN(intValue) || intValue <= 0) {
                throw new Error('page phải là số nguyên lớn hơn 0');
            }
            return true;
        }
        return true;
    }),
    (0, express_validator_1.query)('limit').trim()
        .custom((value, { req }) => {
        if (value) {
            const regex = /^[0-9]+$/; // Chỉ cho phép số
            if (!regex.test(value)) {
                throw new Error('limit không hợp lệ');
            }
            ;
            const intValue = parseInt(value, 10);
            if (isNaN(intValue) || intValue <= 0) {
                throw new Error('limit phải là số nguyên lớn hơn 0');
            }
            return true;
        }
        return true;
    }),
], interviewerController.getAllInterviews);
router.get('/interviews/:interviewId', middleware_1.isAuth, [
    (0, express_validator_1.param)('interviewId').trim().isMongoId().withMessage('interviewId không hợp lệ')
], interviewerController.getSingleInterview);
router.get('/question', middleware_1.isAuth, [
    (0, express_validator_1.query)('skill').trim()
        .custom(async (value, { req }) => {
        if (value) {
            const skill = await skill_1.Skill.findOne({ name: value });
            if (!skill) {
                throw new Error(`Skill: '${value}' không hợp lệ`);
            }
        }
        return true;
    }),
    (0, express_validator_1.query)('type').trim()
        .custom((value) => {
        if (value) {
            if (!utils_1.questionType.includes(value)) {
                throw new Error('Loại câu hỏi không hợp lệ');
            }
            return true;
        }
        return true;
    }),
    (0, express_validator_1.query)('page').trim()
        .custom((value, { req }) => {
        if (value) {
            const regex = /^[0-9]+$/; // Chỉ cho phép số
            if (!regex.test(value)) {
                throw new Error('page không hợp lệ');
            }
            ;
            const intValue = parseInt(value, 10);
            if (isNaN(intValue) || intValue <= 0) {
                throw new Error('page phải là số nguyên lớn hơn 0');
            }
            return true;
        }
        return true;
    }),
    (0, express_validator_1.query)('limit').trim()
        .custom((value, { req }) => {
        if (value) {
            const regex = /^[0-9]+$/; // Chỉ cho phép số
            if (!regex.test(value)) {
                throw new Error('limit không hợp lệ');
            }
            ;
            const intValue = parseInt(value, 10);
            if (isNaN(intValue) || intValue <= 0) {
                throw new Error('limit phải là số nguyên lớn hơn 0');
            }
            return true;
        }
        return true;
    }),
    (0, express_validator_1.query)('content').trim()
        .custom((value) => {
        if (value) {
            const regex = /^[\p{L} ,.?()\/:0-9]+$/u;
            if (!regex.test(value)) {
                throw new Error('Nội dung không được chứa ký tự đặc biệt trừ (dấu cách ,.?()/:)');
            }
            ;
            return true;
        }
        return true;
    })
], interviewerController.getAllQuestions);
router.get('/interview-questions/:questionId', middleware_1.isAuth, [
    (0, express_validator_1.param)('questionId').trim().isMongoId().withMessage('questionId không hợp lệ')
], interviewerController.getSingleQuestion);
router.put('/interview-questions/:questionId', middleware_1.isAuth, [
    (0, express_validator_1.param)('questionId').trim().isMongoId().withMessage('questionId không hợp lệ'),
    (0, express_validator_1.body)('content').trim()
        .notEmpty().withMessage('Vui lòng nhập nội dung câu hỏi')
        .custom((value) => {
        const regex = /^[\p{L} ,.?()\/:0-9]+$/u;
        if (!regex.test(value)) {
            throw new Error('Nội dung không được chứa ký tự đặc biệt trừ (dấu cách ,.?()/:)');
        }
        ;
        return true;
    }),
    (0, express_validator_1.body)('type').trim()
        .notEmpty().withMessage('Vui lòng chọn loại câu hỏi')
        .custom((value) => {
        if (!utils_1.questionType.includes(value)) {
            throw new Error('Loại câu hỏi không hợp lệ');
        }
        return true;
    }),
    (0, express_validator_1.body)('skill').trim()
        .notEmpty().withMessage('Vui lòng chọn loại câu hỏi')
        .custom(async (value) => {
        const skill = await skill_1.Skill.findOne({ name: value });
        if (!skill) {
            throw new Error(`Skill: '${value}' không hợp lệ`);
        }
        return true;
    }),
    (0, express_validator_1.body)('note').trim()
        .custom((value) => {
        if (value) {
            const regex = /^[\p{L} ,.?()%\/:0-9]+$/u;
            if (!regex.test(value)) {
                throw new Error('Ghi chú không được chứa ký tự đặc biệt trừ (dấu cách ,.?()%/:)');
            }
            ;
            return true;
        }
        return true;
    }),
], interviewerController.updateQuestion);
router.delete('/interview-questions/:questionId', middleware_1.isAuth, [
    (0, express_validator_1.param)('questionId').trim().isMongoId().withMessage('questionId không hợp lệ')
], interviewerController.deleteQuestion);
router.get('/skills', middleware_1.isAuth, interviewerController.getSkillQuestion);
router.get('/type', middleware_1.isAuth, interviewerController.getTypeQuestion);
router.get('/interview/:interviewId/questions', middleware_1.isAuth, [
    (0, express_validator_1.param)('interviewId').trim().isMongoId().withMessage('interviewId không hợp lệ')
], interviewerController.getAssignQuestions);
router.post('/interview/:interviewId/questions', middleware_1.isAuth, [
    (0, express_validator_1.param)('interviewId').trim().isMongoId().withMessage('interviewId không hợp lệ'),
    (0, express_validator_1.body)('questions').custom(async (value, { req }) => {
        for (let i = 0; i < value.length; i++) {
            const questionCandidate = await questionCandidate_1.QuestionCandidate.findOne({
                interviewId: req.params.interviewId, 'questions.questionId': value[i].questionId
            });
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
                }
                ;
                const intValue = parseInt(value[i].score, 10);
                if (isNaN(intValue) || intValue > 10) {
                    throw new Error('page phải là số nguyên <= 10');
                }
            }
        }
        return true;
    })
], interviewerController.assignQuestions);
router.put('/interview/:interviewId/questions', middleware_1.isAuth, [
    (0, express_validator_1.param)('interviewId').trim().isMongoId().withMessage('interviewId không hợp lệ'),
    (0, express_validator_1.body)('questions').custom(async (value, { req }) => {
        for (let i = 0; i < value.length; i++) {
            const questionCandidate = await questionCandidate_1.QuestionCandidate.findOne({
                interviewId: req.params.interviewId, 'questions.questionId': value[i].questionId
            });
            if (!questionCandidate) {
                throw new Error(`QuestionId: '${value[i].questionId}' không tồn tại`);
            }
            const regex = /^[\p{L} ,.?()\/:0-9]+$/u;
            if (!regex.test(value[i].content)) {
                throw new Error('Nội dung không được chứa ký tự đặc biệt trừ (dấu cách ,.?()/:)');
            }
            if (!utils_1.questionType.includes(value[i].typeQuestion)) {
                throw new Error(`typeQuestion: ${value[i].typeQuestion} không hợp lệ`);
            }
            const skill = await skill_1.Skill.findOne({ name: value[i].skill });
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
                }
                ;
                const intValue = parseInt(value[i].score, 10);
                if (isNaN(intValue) || intValue > 10) {
                    throw new Error('page phải là số nguyên <= 10');
                }
            }
        }
        return true;
    })
], interviewerController.updateQuestions);
router.delete('/interview/:interviewId/questions/:questionId', middleware_1.isAuth, [
    (0, express_validator_1.param)('interviewId').trim().isMongoId().withMessage('interviewId không hợp lệ'),
    (0, express_validator_1.param)('questionId').trim().isMongoId().withMessage('questionId không hợp lệ')
], interviewerController.deleteAssignQuestion);
router.put('/interview/:interviewId/totalScore', middleware_1.isAuth, [
    (0, express_validator_1.param)('interviewId').trim().isMongoId().withMessage('interviewId không hợp lệ'),
], interviewerController.submitTotalScore);
router.get('/statistics', middleware_1.isAuth, interviewerController.interviewerStatistics);
exports.default = router;
