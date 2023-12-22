import { Router } from "express";
import * as candidateController from '../controllers/candidate.controller';
import { isAuth } from '../middleware';
import { body, param, query } from "express-validator";
import mongoose from "mongoose";

const router = Router();

router.get('/resumes',isAuth, candidateController.getResumes);
router.put('/resumes',isAuth, candidateController.uploadResume);
router.delete('/resumes/:resumeId',isAuth,
    param('resumeId').trim().isMongoId().withMessage('Id không hợp lệ')
, candidateController.deleteResume);

router.get('/applied-jobs/:jobId', isAuth, [
    param('jobId').trim().isMongoId().withMessage('Id không hợp lệ')
], candidateController.checkApply);

router.post('/jobs/:jobId', isAuth, [
    param('jobId').trim().isMongoId().withMessage('jobId không hợp lệ'),
    body('resumeId').trim().isMongoId().withMessage('resumeId không hợp lệ')
], candidateController.applyJob);

router.get('/jobs/applicants', isAuth, [
    query('page').trim()
        .custom((value) => {
            if (value) {
                const regex = /^[0-9]+$/; // Chỉ cho phép số
                if (!regex.test(value)) {
                    throw new Error('page không hợp lệ');
                };
                return true;
            }
            return true;
        }),
    query('limit').trim()
        .custom((value) => {
            if (value) {
                const regex = /^[0-9]+$/; // Chỉ cho phép số
                if (!regex.test(value)) {
                    throw new Error('limit không hợp lệ');
                };
                return true;
            }
            return true;
        })
], candidateController.getAppliedJobs);

router.put('/information', isAuth, [

], candidateController.saveInformation);

router.get('/information', isAuth, candidateController.getInformation);

router.get('/interviews', isAuth, [
    query('page').trim()
        .custom((value) => {
            if (value) {
                const regex = /^[0-9]+$/; // Chỉ cho phép số
                if (!regex.test(value)) {
                    throw new Error('page không hợp lệ');
                };
                return true;
            }
            return true;
        }),
    query('limit').trim()
        .custom((value) => {
            if (value) {
                const regex = /^[0-9]+$/; // Chỉ cho phép số
                if (!regex.test(value)) {
                    throw new Error('limit không hợp lệ');
                };
                return true;
            }
            return true;
        })
], candidateController.getAllInterviews)


export default router;

