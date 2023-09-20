import { Router } from "express";
import * as candidateController from '../controllers/candidate.controller';
import { isAuth } from '../middleware';

const router = Router();

router.put('/resumes',isAuth, candidateController.uploadCV);

export default router;