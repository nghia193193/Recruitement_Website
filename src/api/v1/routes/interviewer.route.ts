import { Router } from "express";
import { interviewerController } from '../controllers/interviewer.controller';
import { isAuth } from '../middleware';
import { body, param, query } from "express-validator";
import { questionType, skills } from "../utils";
import { QuestionCandidate } from "../models/questionCandidate";
import createHttpError from "http-errors";
import sanitizeHtml from "sanitize-html";

const router = Router();

router.put('/information', isAuth, [
    body('education').custom((value => {
        if (value.length !== 0) {
            for (let i = 0; i < value.length; i++) {
                value[i].school = sanitizeHtml(value[i].school);
                value[i].major = sanitizeHtml(value[i].major);
                value[i].graduatedYear = sanitizeHtml(value[i].graduatedYear);
            }
        }
        return true;
    })),
    body('experience').custom((value => {
        if (value.length !== 0) {
            for (let i = 0; i < value.length; i++) {
                value[i].companyName = sanitizeHtml(value[i].companyName);
                value[i].position = sanitizeHtml(value[i].position);
                value[i].dateFrom = sanitizeHtml(value[i].dateFrom);
                value[i].dateTo = sanitizeHtml(value[i].dateTo);
            }
        }
        return true;
    })),
    body('certificate').custom((value => {
        if (value.length !== 0) {
            for (let i = 0; i < value.length; i++) {
                value[i].name = sanitizeHtml(value[i].name);
                value[i].receivedDate = sanitizeHtml(value[i].receivedDate);
                value[i].url = sanitizeHtml(value[i].url);
            }
        }
        return true;
    })),
    body('project').custom((value => {
        if (value.length !== 0) {
            for (let i = 0; i < value.length; i++) {
                value[i].name = sanitizeHtml(value[i].name);
                value[i].description = sanitizeHtml(value[i].description);
                value[i].url = sanitizeHtml(value[i].url);
            }
        }
        return true;
    })),
    body('skills').custom((value => {
        if (value.length !== 0) {
            for (let i = 0; i < value.length; i++) {
                if (!skills.includes(value[i])) {
                    throw createHttpError.BadRequest(`Skill: '${value[i]}' không hợp lệ`);
                }
            }
        }
        return true;
    })),
], interviewerController.saveInformation);

router.get('/information', isAuth, interviewerController.getInformation);

router.post('/interview-questions', isAuth, [
    body('content').trim()
        .notEmpty().withMessage('Vui lòng nhập nội dung câu hỏi')
        .custom((value: string) => {
            const regex = /^[\p{L} ,.?()%\/:0-9]+$/u;
            if (!regex.test(value)) {
                throw createHttpError.BadRequest('Nội dung không được chứa ký tự đặc biệt trừ (dấu cách ,.?()%/:)');
            };
            return true;
        }),
    body('type').trim()
        .notEmpty().withMessage('Vui lòng chọn loại câu hỏi')
        .custom((value: string) => {
            if (!questionType.includes(value)) {
                throw createHttpError.BadRequest('Loại câu hỏi không hợp lệ');
            }
            return true
        }),
    body('skill').trim()
        .notEmpty().withMessage('Vui lòng chọn loại câu hỏi')
        .custom((value) => {
            if (!skills.includes(value)) {
                throw createHttpError.BadRequest(`Skill: '${value}' không hợp lệ`);
            }
            return true;
        }),
    body('note').trim()
        .custom((value: string) => {
            if (value) {
                const regex = /^[\p{L} ,.?()%\/:0-9]+$/u;
                if (!regex.test(value)) {
                    throw createHttpError.BadRequest('Ghi chú không được chứa ký tự đặc biệt trừ (dấu cách ,.?()%/:)');
                };
                return true;
            }
            return true;
        }),
], interviewerController.createQuestion);

router.get('/candidates', isAuth, [
    query('page').trim()
        .custom((value, { req }) => {
            if (value) {
                const regex = /^[0-9]+$/; // Chỉ cho phép số
                if (!regex.test(value)) {
                    throw new createHttpError.BadRequest('page không hợp lệ');
                };
                const intValue = parseInt(value, 10);
                if (isNaN(intValue) || intValue <= 0) {
                    throw createHttpError.BadRequest('page phải là số nguyên lớn hơn 0');
                }
                return true;
            }
            return true;
        }),
    query('limit').trim()
        .custom((value, { req }) => {
            if (value) {
                const regex = /^[0-9]+$/; // Chỉ cho phép số
                if (!regex.test(value)) {
                    throw createHttpError.BadRequest('limit không hợp lệ');
                };
                const intValue = parseInt(value, 10);
                if (isNaN(intValue) || intValue <= 0) {
                    throw createHttpError.BadRequest('limit phải là số nguyên lớn hơn 0');
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
        .custom((value, { req }) => {
            if (value) {
                const regex = /^[0-9]+$/; // Chỉ cho phép số
                if (!regex.test(value)) {
                    throw createHttpError.BadRequest('page không hợp lệ');
                };
                const intValue = parseInt(value, 10);
                if (isNaN(intValue) || intValue <= 0) {
                    throw createHttpError.BadRequest('page phải là số nguyên lớn hơn 0');
                }
                return true;
            }
            return true;
        }),
    query('limit').trim()
        .custom((value, { req }) => {
            if (value) {
                const regex = /^[0-9]+$/; // Chỉ cho phép số
                if (!regex.test(value)) {
                    throw createHttpError.BadRequest('limit không hợp lệ');
                };
                const intValue = parseInt(value, 10);
                if (isNaN(intValue) || intValue <= 0) {
                    throw createHttpError.BadRequest('limit phải là số nguyên lớn hơn 0');
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
        .custom((value, { req }) => {
            if (value) {
                if (!skills.includes(value)) {
                    throw createHttpError.BadRequest(`Skill: '${value}' không hợp lệ`)
                }
            }
            return true;
        }),
    query('type').trim()
        .custom((value: string) => {
            if (value) {
                if (!questionType.includes(value)) {
                    throw createHttpError.BadRequest('Loại câu hỏi không hợp lệ');
                }
            }
            return true;
        }),
    query('page').trim()
        .custom((value, { req }) => {
            if (value) {
                const regex = /^[0-9]+$/; // Chỉ cho phép số
                if (!regex.test(value)) {
                    throw createHttpError.BadRequest('page không hợp lệ');
                };
                const intValue = parseInt(value, 10);
                if (isNaN(intValue) || intValue <= 0) {
                    throw createHttpError.BadRequest('page phải là số nguyên lớn hơn 0');
                }
                return true;
            }
            return true;
        }),
    query('limit').trim()
        .custom((value, { req }) => {
            if (value) {
                const regex = /^[0-9]+$/; // Chỉ cho phép số
                if (!regex.test(value)) {
                    throw createHttpError.BadRequest('limit không hợp lệ');
                };
                const intValue = parseInt(value, 10);
                if (isNaN(intValue) || intValue <= 0) {
                    throw createHttpError.BadRequest('limit phải là số nguyên lớn hơn 0');
                }
                return true;
            }
            return true;
        }),
    query('content').trim()
        .customSanitizer((value: string) => {
            return sanitizeHtml(value);
        }),
], interviewerController.getAllQuestions);

router.get('/interview-questions/:questionId', isAuth, [
    param('questionId').trim().isMongoId().withMessage('questionId không hợp lệ')
], interviewerController.getSingleQuestion);

router.put('/interview-questions/:questionId', isAuth, [
    param('questionId').trim().isMongoId().withMessage('questionId không hợp lệ'),
    body('content').trim()
        .notEmpty().withMessage('Vui lòng nhập nội dung câu hỏi')
        .customSanitizer((value: string) => {
            return sanitizeHtml(value);
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
        .custom((value) => {
            if (!skills.includes(value)) {
                throw createHttpError.BadRequest(`Skill: '${value}' không hợp lệ`);
            }
            return true;
        }),
    body('note').trim()
        .customSanitizer((value: string) => {
            return sanitizeHtml(value);
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
    body('questions').custom(async (value, { req }) => {
        for (let i = 0; i < value.length; i++) {
            const questionCandidate = await QuestionCandidate.findOne({
                interviewId: (req.params as any).interviewId, 'questions.questionId': value[i].questionId
            });
            if (questionCandidate) {
                throw createHttpError.BadRequest(`QuestionId: '${value[i].questionId}' đã tồn tại`);
            }
            const regex = /^[\p{L} ,.?()\n\/:0-9]+$/u;
            if (value[i].note) {
                if (!regex.test(value[i].note)) {
                    throw createHttpError.BadRequest('Note không được chứa ký tự đặc biệt trừ (dấu cách ,.?()/:)');
                }
            }
            if (value[i].score) {
                const regex = /^[0-9]+$/;
                if (!regex.test(value[i].score)) {
                    throw createHttpError.BadRequest(`score không hợp lệ`);
                };
                const intValue = parseInt(value[i].score, 10);
                if (isNaN(intValue) || intValue > 10) {
                    throw createHttpError.BadRequest('page phải là số nguyên <= 10');
                }
            }
        }
        return true;
    })
], interviewerController.assignQuestions);

router.put('/interview/:interviewId/questions', isAuth, [
    param('interviewId').trim().isMongoId().withMessage('interviewId không hợp lệ'),
    body('questions').custom(async (value, { req }) => {
        for (let i = 0; i < value.length; i++) {
            const questionCandidate = await QuestionCandidate.findOne({
                interviewId: (req.params as any).interviewId, 'questions.questionId': value[i].questionId
            });
            if (!questionCandidate) {
                throw createHttpError.NotFound(`QuestionId: '${value[i].questionId}' không tồn tại`);
            }
            const regex = /^[\p{L} ,.?()\n\/:0-9]+$/u;
            if (!regex.test(value[i].content)) {
                throw createHttpError.BadRequest('Nội dung không được chứa ký tự đặc biệt trừ (dấu cách ,.?()/:)');
            }
            if (!questionType.includes(value[i].typeQuestion)) {
                throw createHttpError.BadRequest(`typeQuestion: ${value[i].typeQuestion} không hợp lệ`);
            }
            if (!skills.includes(value[i].skill)) {
                throw createHttpError.BadRequest(`skill: ${value[i].skill} không hợp lệ`);
            }
            if (value[i].note) {
                if (!regex.test(value[i].note)) {
                    throw createHttpError.BadRequest('Note không được chứa ký tự đặc biệt trừ (dấu cách ,.?()/:)');
                }
            }
            if (value[i].score) {
                const regex = /^[0-9]+$/;
                if (!regex.test(value[i].score)) {
                    throw createHttpError.BadRequest(`score không hợp lệ`);
                };
                const intValue = parseInt(value[i].score, 10);
                if (isNaN(intValue) || intValue > 10) {
                    throw createHttpError.BadRequest('page phải là số nguyên <= 10');
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

router.get('/statistics', isAuth, interviewerController.interviewerStatistics);

export default router;