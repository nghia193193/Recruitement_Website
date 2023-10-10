import { Router } from 'express';
import {param} from 'express-validator'
import * as eventController from '../controllers/event.controller';

const router = Router();

router.get('/', eventController.GetAllEvents);
router.get('/:eventId',
    param('eventId').trim().isMongoId().withMessage('Id không hợp lệ')
 , eventController.GetSingleEvent);

export default router;