"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const candidate_controller_1 = require("../controllers/candidate.controller");
const middleware_1 = require("../middleware");
const express_validator_1 = require("express-validator");
const sanitize_html_1 = __importDefault(require("sanitize-html"));
const http_errors_1 = __importDefault(require("http-errors"));
const utils_1 = require("../utils");
const router = (0, express_1.Router)();
router.get('/resumes', middleware_1.isAuth, candidate_controller_1.candidateController.getResumes);
router.put('/resumes', middleware_1.isAuth, candidate_controller_1.candidateController.uploadResume);
router.delete('/resumes/:resumeId', middleware_1.isAuth, (0, express_validator_1.param)('resumeId').trim().isMongoId().withMessage('Id không hợp lệ'), candidate_controller_1.candidateController.deleteResume);
router.get('/applied-jobs/:jobId', middleware_1.isAuth, [
    (0, express_validator_1.param)('jobId').trim().isMongoId().withMessage('Id không hợp lệ')
], candidate_controller_1.candidateController.checkApply);
router.post('/jobs/:jobId', middleware_1.isAuth, [
    (0, express_validator_1.param)('jobId').trim().isMongoId().withMessage('jobId không hợp lệ'),
    (0, express_validator_1.body)('resumeId').trim().isMongoId().withMessage('resumeId không hợp lệ')
], candidate_controller_1.candidateController.applyJob);
router.get('/jobs/applicants', middleware_1.isAuth, [
    (0, express_validator_1.query)('page').trim()
        .custom((value) => {
        if (value) {
            const regex = /^[0-9]+$/; // Chỉ cho phép số
            if (!regex.test(value)) {
                throw new Error('page không hợp lệ');
            }
            ;
            return true;
        }
        return true;
    }),
    (0, express_validator_1.query)('limit').trim()
        .custom((value) => {
        if (value) {
            const regex = /^[0-9]+$/; // Chỉ cho phép số
            if (!regex.test(value)) {
                throw new Error('limit không hợp lệ');
            }
            ;
            return true;
        }
        return true;
    })
], candidate_controller_1.candidateController.getAppliedJobs);
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
], candidate_controller_1.candidateController.saveInformation);
router.get('/information', middleware_1.isAuth, candidate_controller_1.candidateController.getInformation);
router.get('/interviews', middleware_1.isAuth, [
    (0, express_validator_1.query)('page').trim()
        .custom((value) => {
        if (value) {
            const regex = /^[0-9]+$/; // Chỉ cho phép số
            if (!regex.test(value)) {
                throw new Error('page không hợp lệ');
            }
            ;
            return true;
        }
        return true;
    }),
    (0, express_validator_1.query)('limit').trim()
        .custom((value) => {
        if (value) {
            const regex = /^[0-9]+$/; // Chỉ cho phép số
            if (!regex.test(value)) {
                throw new Error('limit không hợp lệ');
            }
            ;
            return true;
        }
        return true;
    })
], candidate_controller_1.candidateController.getAllInterviews);
router.put('/favorite-jobs/:jobId', middleware_1.isAuth, [
    (0, express_validator_1.param)('jobId').trim().notEmpty().isMongoId().withMessage('jobId không hợp lệ')
], candidate_controller_1.candidateController.addFavoriteJob);
router.get('/favorite-jobs', middleware_1.isAuth, candidate_controller_1.candidateController.getFavoriteJob);
exports.default = router;
