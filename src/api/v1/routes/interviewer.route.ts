import { Router } from "express";
import * as interviewerController from '../controllers/interviewer.controller';
import { isAuth } from '../middleware';
import { body, param, query } from "express-validator";

const router = Router();

router.put('/information', isAuth, interviewerController.saveInformation);
router.get('/information', isAuth, interviewerController.getInformation);

export default router;