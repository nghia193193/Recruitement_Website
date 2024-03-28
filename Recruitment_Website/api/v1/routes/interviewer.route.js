"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const interviewer_controller_1 = require("../controllers/interviewer.controller");
const middleware_1 = require("../middleware");
const express_validator_1 = require("express-validator");
const utils_1 = require("../utils");
const questionCandidate_1 = require("../models/questionCandidate");
const http_errors_1 = __importDefault(require("http-errors"));
const sanitize_html_1 = __importDefault(require("sanitize-html"));
const router = (0, express_1.Router)();
router.put('/information', middleware_1.isAuth, [
    (0, express_validator_1.body)('education').custom((value => {
        if (value.length !== 0) {
            for (let i = 0; i < value.length; i++) {
                value[i].school = (0, sanitize_html_1.default)(value[i].school);
                value[i].major = (0, sanitize_html_1.default)(value[i].major);
                value[i].graduatedYear = (0, sanitize_html_1.default)(value[i].graduatedYear);
            }
        }
        return true;
    })),
    (0, express_validator_1.body)('experience').custom((value => {
        if (value.length !== 0) {
            for (let i = 0; i < value.length; i++) {
                value[i].companyName = (0, sanitize_html_1.default)(value[i].companyName);
                value[i].position = (0, sanitize_html_1.default)(value[i].position);
                value[i].dateFrom = (0, sanitize_html_1.default)(value[i].dateFrom);
                value[i].dateTo = (0, sanitize_html_1.default)(value[i].dateTo);
            }
        }
        return true;
    })),
    (0, express_validator_1.body)('certificate').custom((value => {
        if (value.length !== 0) {
            for (let i = 0; i < value.length; i++) {
                value[i].name = (0, sanitize_html_1.default)(value[i].name);
                value[i].receivedDate = (0, sanitize_html_1.default)(value[i].receivedDate);
                value[i].url = (0, sanitize_html_1.default)(value[i].url);
            }
        }
        return true;
    })),
    (0, express_validator_1.body)('project').custom((value => {
        if (value.length !== 0) {
            for (let i = 0; i < value.length; i++) {
                value[i].name = (0, sanitize_html_1.default)(value[i].name);
                value[i].description = (0, sanitize_html_1.default)(value[i].description);
                value[i].url = (0, sanitize_html_1.default)(value[i].url);
            }
        }
        return true;
    })),
    (0, express_validator_1.body)('skills').custom((value => {
        if (value.length !== 0) {
            for (let i = 0; i < value.length; i++) {
                if (!utils_1.skills.includes(value[i])) {
                    throw http_errors_1.default.BadRequest(`Skill: '${value[i]}' không hợp lệ`);
                }
            }
        }
        return true;
    })),
], interviewer_controller_1.interviewerController.saveInformation);
router.get('/information', middleware_1.isAuth, interviewer_controller_1.interviewerController.getInformation);
router.post('/interview-questions', middleware_1.isAuth, [
    (0, express_validator_1.body)('content').trim()
        .notEmpty().withMessage('Vui lòng nhập nội dung câu hỏi')
        .custom((value) => {
        const regex = /^[\p{L} ,.?()%\/:0-9]+$/u;
        if (!regex.test(value)) {
            throw http_errors_1.default.BadRequest('Nội dung không được chứa ký tự đặc biệt trừ (dấu cách ,.?()%/:)');
        }
        ;
        return true;
    }),
    (0, express_validator_1.body)('type').trim()
        .notEmpty().withMessage('Vui lòng chọn loại câu hỏi')
        .custom((value) => {
        if (!utils_1.questionType.includes(value)) {
            throw http_errors_1.default.BadRequest('Loại câu hỏi không hợp lệ');
        }
        return true;
    }),
    (0, express_validator_1.body)('skill').trim()
        .notEmpty().withMessage('Vui lòng chọn loại câu hỏi')
        .custom((value) => {
        if (!utils_1.skills.includes(value)) {
            throw http_errors_1.default.BadRequest(`Skill: '${value}' không hợp lệ`);
        }
        return true;
    }),
    (0, express_validator_1.body)('note').trim()
        .custom((value) => {
        if (value) {
            const regex = /^[\p{L} ,.?()%\/:0-9]+$/u;
            if (!regex.test(value)) {
                throw http_errors_1.default.BadRequest('Ghi chú không được chứa ký tự đặc biệt trừ (dấu cách ,.?()%/:)');
            }
            ;
            return true;
        }
        return true;
    }),
], interviewer_controller_1.interviewerController.createQuestion);
router.get('/candidates', middleware_1.isAuth, [
    (0, express_validator_1.query)('page').trim()
        .custom((value, { req }) => {
        if (value) {
            const regex = /^[0-9]+$/; // Chỉ cho phép số
            if (!regex.test(value)) {
                throw new http_errors_1.default.BadRequest('page không hợp lệ');
            }
            ;
            const intValue = parseInt(value, 10);
            if (isNaN(intValue) || intValue <= 0) {
                throw http_errors_1.default.BadRequest('page phải là số nguyên lớn hơn 0');
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
                throw http_errors_1.default.BadRequest('limit không hợp lệ');
            }
            ;
            const intValue = parseInt(value, 10);
            if (isNaN(intValue) || intValue <= 0) {
                throw http_errors_1.default.BadRequest('limit phải là số nguyên lớn hơn 0');
            }
            return true;
        }
        return true;
    }),
], interviewer_controller_1.interviewerController.getAllApplicants);
router.get('/candidates/:candidateId', middleware_1.isAuth, [
    (0, express_validator_1.param)('candidateId').trim().isMongoId().withMessage('candidateId không hợp lệ')
], interviewer_controller_1.interviewerController.getSingleApplicant);
router.get('/interviews', middleware_1.isAuth, [
    (0, express_validator_1.query)('page').trim()
        .custom((value, { req }) => {
        if (value) {
            const regex = /^[0-9]+$/; // Chỉ cho phép số
            if (!regex.test(value)) {
                throw http_errors_1.default.BadRequest('page không hợp lệ');
            }
            ;
            const intValue = parseInt(value, 10);
            if (isNaN(intValue) || intValue <= 0) {
                throw http_errors_1.default.BadRequest('page phải là số nguyên lớn hơn 0');
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
                throw http_errors_1.default.BadRequest('limit không hợp lệ');
            }
            ;
            const intValue = parseInt(value, 10);
            if (isNaN(intValue) || intValue <= 0) {
                throw http_errors_1.default.BadRequest('limit phải là số nguyên lớn hơn 0');
            }
            return true;
        }
        return true;
    }),
], interviewer_controller_1.interviewerController.getAllInterviews);
router.get('/interviews/:interviewId', middleware_1.isAuth, [
    (0, express_validator_1.param)('interviewId').trim().isMongoId().withMessage('interviewId không hợp lệ')
], interviewer_controller_1.interviewerController.getSingleInterview);
router.get('/question', middleware_1.isAuth, [
    (0, express_validator_1.query)('skill').trim()
        .custom((value, { req }) => {
        if (value) {
            if (!utils_1.skills.includes(value)) {
                throw http_errors_1.default.BadRequest(`Skill: '${value}' không hợp lệ`);
            }
        }
        return true;
    }),
    (0, express_validator_1.query)('type').trim()
        .custom((value) => {
        if (value) {
            if (!utils_1.questionType.includes(value)) {
                throw http_errors_1.default.BadRequest('Loại câu hỏi không hợp lệ');
            }
        }
        return true;
    }),
    (0, express_validator_1.query)('page').trim()
        .custom((value, { req }) => {
        if (value) {
            const regex = /^[0-9]+$/; // Chỉ cho phép số
            if (!regex.test(value)) {
                throw http_errors_1.default.BadRequest('page không hợp lệ');
            }
            ;
            const intValue = parseInt(value, 10);
            if (isNaN(intValue) || intValue <= 0) {
                throw http_errors_1.default.BadRequest('page phải là số nguyên lớn hơn 0');
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
                throw http_errors_1.default.BadRequest('limit không hợp lệ');
            }
            ;
            const intValue = parseInt(value, 10);
            if (isNaN(intValue) || intValue <= 0) {
                throw http_errors_1.default.BadRequest('limit phải là số nguyên lớn hơn 0');
            }
            return true;
        }
        return true;
    }),
    (0, express_validator_1.query)('content').trim()
        .customSanitizer((value) => {
        return (0, sanitize_html_1.default)(value);
    }),
], interviewer_controller_1.interviewerController.getAllQuestions);
router.get('/interview-questions/:questionId', middleware_1.isAuth, [
    (0, express_validator_1.param)('questionId').trim().isMongoId().withMessage('questionId không hợp lệ')
], interviewer_controller_1.interviewerController.getSingleQuestion);
router.put('/interview-questions/:questionId', middleware_1.isAuth, [
    (0, express_validator_1.param)('questionId').trim().isMongoId().withMessage('questionId không hợp lệ'),
    (0, express_validator_1.body)('content').trim()
        .notEmpty().withMessage('Vui lòng nhập nội dung câu hỏi')
        .customSanitizer((value) => {
        return (0, sanitize_html_1.default)(value);
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
        .custom((value) => {
        if (!utils_1.skills.includes(value)) {
            throw http_errors_1.default.BadRequest(`Skill: '${value}' không hợp lệ`);
        }
        return true;
    }),
    (0, express_validator_1.body)('note').trim()
        .customSanitizer((value) => {
        return (0, sanitize_html_1.default)(value);
    }),
], interviewer_controller_1.interviewerController.updateQuestion);
router.delete('/interview-questions/:questionId', middleware_1.isAuth, [
    (0, express_validator_1.param)('questionId').trim().isMongoId().withMessage('questionId không hợp lệ')
], interviewer_controller_1.interviewerController.deleteQuestion);
router.get('/skills', middleware_1.isAuth, interviewer_controller_1.interviewerController.getSkillQuestion);
router.get('/type', middleware_1.isAuth, interviewer_controller_1.interviewerController.getTypeQuestion);
router.get('/interview/:interviewId/questions', middleware_1.isAuth, [
    (0, express_validator_1.param)('interviewId').trim().isMongoId().withMessage('interviewId không hợp lệ')
], interviewer_controller_1.interviewerController.getAssignQuestions);
router.post('/interview/:interviewId/questions', middleware_1.isAuth, [
    (0, express_validator_1.param)('interviewId').trim().isMongoId().withMessage('interviewId không hợp lệ'),
    (0, express_validator_1.body)('questions').custom(async (value, { req }) => {
        for (let i = 0; i < value.length; i++) {
            const questionCandidate = await questionCandidate_1.QuestionCandidate.findOne({
                interviewId: req.params.interviewId, 'questions.questionId': value[i].questionId
            });
            if (questionCandidate) {
                throw http_errors_1.default.BadRequest(`QuestionId: '${value[i].questionId}' đã tồn tại`);
            }
            const regex = /^[\p{L} ,.?()\n\/:0-9]+$/u;
            if (value[i].note) {
                if (!regex.test(value[i].note)) {
                    throw http_errors_1.default.BadRequest('Note không được chứa ký tự đặc biệt trừ (dấu cách ,.?()/:)');
                }
            }
            if (value[i].score) {
                const regex = /^[0-9]+$/;
                if (!regex.test(value[i].score)) {
                    throw http_errors_1.default.BadRequest(`score không hợp lệ`);
                }
                ;
                const intValue = parseInt(value[i].score, 10);
                if (isNaN(intValue) || intValue > 10) {
                    throw http_errors_1.default.BadRequest('page phải là số nguyên <= 10');
                }
            }
        }
        return true;
    })
], interviewer_controller_1.interviewerController.assignQuestions);
router.put('/interview/:interviewId/questions', middleware_1.isAuth, [
    (0, express_validator_1.param)('interviewId').trim().isMongoId().withMessage('interviewId không hợp lệ'),
    (0, express_validator_1.body)('questions').custom(async (value, { req }) => {
        for (let i = 0; i < value.length; i++) {
            const questionCandidate = await questionCandidate_1.QuestionCandidate.findOne({
                interviewId: req.params.interviewId, 'questions.questionId': value[i].questionId
            });
            if (!questionCandidate) {
                throw http_errors_1.default.NotFound(`QuestionId: '${value[i].questionId}' không tồn tại`);
            }
            const regex = /^[\p{L} ,.?()\n\/:0-9]+$/u;
            if (!regex.test(value[i].content)) {
                throw http_errors_1.default.BadRequest('Nội dung không được chứa ký tự đặc biệt trừ (dấu cách ,.?()/:)');
            }
            if (!utils_1.questionType.includes(value[i].typeQuestion)) {
                throw http_errors_1.default.BadRequest(`typeQuestion: ${value[i].typeQuestion} không hợp lệ`);
            }
            if (!utils_1.skills.includes(value[i].skill)) {
                throw http_errors_1.default.BadRequest(`skill: ${value[i].skill} không hợp lệ`);
            }
            if (value[i].note) {
                if (!regex.test(value[i].note)) {
                    throw http_errors_1.default.BadRequest('Note không được chứa ký tự đặc biệt trừ (dấu cách ,.?()/:)');
                }
            }
            if (value[i].score) {
                const regex = /^[0-9]+$/;
                if (!regex.test(value[i].score)) {
                    throw http_errors_1.default.BadRequest(`score không hợp lệ`);
                }
                ;
                const intValue = parseInt(value[i].score, 10);
                if (isNaN(intValue) || intValue > 10) {
                    throw http_errors_1.default.BadRequest('page phải là số nguyên <= 10');
                }
            }
        }
        return true;
    })
], interviewer_controller_1.interviewerController.updateQuestions);
router.delete('/interview/:interviewId/questions/:questionId', middleware_1.isAuth, [
    (0, express_validator_1.param)('interviewId').trim().isMongoId().withMessage('interviewId không hợp lệ'),
    (0, express_validator_1.param)('questionId').trim().isMongoId().withMessage('questionId không hợp lệ')
], interviewer_controller_1.interviewerController.deleteAssignQuestion);
router.put('/interview/:interviewId/totalScore', middleware_1.isAuth, [
    (0, express_validator_1.param)('interviewId').trim().isMongoId().withMessage('interviewId không hợp lệ'),
], interviewer_controller_1.interviewerController.submitTotalScore);
router.get('/statistics', middleware_1.isAuth, interviewer_controller_1.interviewerController.interviewerStatistics);
exports.default = router;
