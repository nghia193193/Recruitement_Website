"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const candidate_controller_1 = require("../controllers/candidate.controller");
const middleware_1 = require("../middleware");
const express_validator_1 = require("express-validator");
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
router.put('/information', middleware_1.isAuth, [], candidate_controller_1.candidateController.saveInformation);
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
