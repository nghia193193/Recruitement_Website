import { Router } from "express";
import * as candidateController from '../controllers/candidate.controller';
import { isAuth } from '../middleware';
import { param } from "express-validator";
import mongoose from "mongoose";

const router = Router();

router.get('/resumes',isAuth, candidateController.GetResumes);
router.put('/resumes',isAuth, candidateController.UploadResume);
router.delete('/resumes/:resumeId',isAuth,
    param('resumeId').trim().isMongoId().withMessage('Id không hợp lệ')
, candidateController.DeleteResume);

export default router;