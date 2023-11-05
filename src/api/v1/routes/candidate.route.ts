import { Router } from "express";
import * as candidateController from '../controllers/candidate.controller';
import { isAuth } from '../middleware';
import { body, param } from "express-validator";
import mongoose from "mongoose";

const router = Router();

router.get('/resumes',isAuth, candidateController.GetResumes);
router.put('/resumes',isAuth, candidateController.UploadResume);
router.delete('/resumes/:resumeId',isAuth,
    param('resumeId').trim().isMongoId().withMessage('Id không hợp lệ')
, candidateController.DeleteResume);

router.get('/applied-jobs/:jobId', isAuth, [
    param('jobId').trim().isMongoId().withMessage('Id không hợp lệ')
], candidateController.CheckApply);

router.post('/jobs/:jobId', isAuth, [
    param('jobId').trim().isMongoId().withMessage('jobId không hợp lệ'),
    body('resumeId').trim().isMongoId().withMessage('resumeId không hợp lệ')
], candidateController.ApplyJob);
 
export default router;

