import { Router } from 'express';
import {param} from 'express-validator'
import * as eventController from '../controllers/event';

const router = Router();

router.get('/api/v1/events', eventController.getAllEvents);
router.get('/api/v1/events/:eventId',
    param('eventId').trim().isMongoId().withMessage('Id không hợp lệ')
 , eventController.getSingleEvent);

export default router;