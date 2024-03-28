import { Router } from 'express';
import { query, param } from 'express-validator';
import { jobController } from '../controllers/job.controller';
import { jobLocation, jobPosition, jobType } from '../utils';
import sanitizeHtml from 'sanitize-html';

const router = Router();

router.get('/', [
    query('name').trim()
        .customSanitizer((value: string) => {
            if (value) {
                const sanitizedValue = sanitizeHtml(value);
                return sanitizedValue;
            }
        }),
    query('position').trim()
        .custom((value: string, { req }) => {
            if (value) {
                if (!jobPosition.includes(value)) {
                    throw new Error(`Failed to convert 'position' with value: '${value}'`);
                }
            }
            return true
        }),
    query('type').trim()
        .custom((value: string, { req }) => {
            if (value) {
                if (!jobType.includes(value)) {
                    throw new Error(`Failed to convert 'position' with value: '${value}'`);
                }
            }
            return true
        }),
    query('location').trim()
        .custom((value: string, { req }) => {
            if (value) {
                if (!jobLocation.includes(value)) {
                    throw new Error(`Failed to convert 'position' with value: '${value}'`);
                }
            }
            return true
        }),
    query('page').trim()
        .custom((value: string, { req }) => {
            if (value) {
                const regex = /^[0-9]+$/;
                if (!regex.test(value)) {
                    throw new Error('page không hợp lệ');
                };
                const intValue = parseInt(value, 10);
                if (isNaN(intValue) || intValue <= 0) {
                    throw new Error('page phải là số nguyên lớn hơn 0');
                }
            }
            return true;
        }),
    query('limit').trim()
        .custom((value: string, { req }) => {
            if (value) {
                const regex = /^[0-9]+$/;
                if (!regex.test(value)) {
                    throw new Error('limit không hợp lệ');
                };
                const intValue = parseInt(value, 10);
                if (isNaN(intValue) || intValue <= 0) {
                    throw new Error('limit phải là số nguyên lớn hơn 0');
                }
            }
            return true;
        }),
], jobController.getJobs);

router.get('/location', jobController.getLocation);
router.get('/position', jobController.getPosition);
router.get('/type', jobController.getType);

router.get('/:jobId',
    param('jobId').trim().isMongoId().withMessage('Id không hợp lệ')
    , jobController.getSingleJob);


export default router;