import { Router } from 'express';
import { body, query, param } from 'express-validator';
import * as jobController from '../controllers/job.controller';
import { Job } from '../models/job';
import { JobPosition } from '../models/jobPosition';
import { JobType } from '../models/jobType';
import { JobLocation } from '../models/jobLocation';

const router = Router();

router.get('/',[
    query('name').trim().custom((value: string, {req}) => {
        if (value) {
            const regex = /^[\p{L} 0-9]+$/u;
            if (!regex.test(value)) {
                throw new Error('Tên không được chứa ký tự đặc biệt trừ dấu cách');
            };
            return true;
        }
        return true;
    }),
    query('position').trim()
        .custom((value: string, {req}) => {  
            if (value) {
                return JobPosition.findOne({name: value})
                    .then(jobPos => {
                        if (!jobPos) {
                            return Promise.reject(`Failed to convert 'position' with value: '${value}'`)
                        }
                        return true
                    })   
            }  
            return true        
        }),
    query('type').trim()
        .custom((value: string, {req}) => {
            if (value) {
                return JobType.findOne({name: value})
                    .then(job => {
                        if (!job) {
                            return Promise.reject(`Failed to convert 'type' with value: '${value}'`)
                        }
                        return true
                    })
            }
            return true
        }),
    query('location').trim()
        .custom((value: string, {req}) => {
            if (value) {
                return JobLocation.findOne({name: value})
                    .then(job => {
                        if (!job) {
                            return Promise.reject(`Failed to convert 'location' with value: '${value}'`)
                        }
                        return true
                    })
            }
            return true
        }),
    query('page').trim()
        .custom((value: string, {req}) => {
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
        .custom((value: string, {req}) => {
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
], jobController.GetJobs);

router.get('/location', jobController.GetLocation);
router.get('/position', jobController.GetPosition);
router.get('/type', jobController.GetType);

router.get('/:jobId',
    param('jobId').trim().isMongoId().withMessage('Id không hợp lệ')
, jobController.GetSingleJob);


export default router;