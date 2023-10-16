import { Router } from "express";
import * as skillController from '../controllers/skill.controller';

const router = Router();

router.get('/', skillController.GetAllSkills);

export default router;