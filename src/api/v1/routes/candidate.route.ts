import { Router } from "express";
import * as candidateController from '../controllers/candidate.controller';
import { isAuth } from '../middleware';
import { param } from "express-validator";
import mongoose from "mongoose";

const router = Router();

router.get('/resumes',isAuth, candidateController.getResumes);
router.put('/resumes',isAuth, candidateController.uploadResume);
router.delete('/resumes/:resumeId',isAuth,
    param('resumeId').trim().custom((value: string, {req}) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
            throw new Error('Id không hợp lệ');
        }
        return true;
    })
, candidateController.deleteResume);

export default router;