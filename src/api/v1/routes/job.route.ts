import { Router } from 'express';
import { body, query, param } from 'express-validator';
import * as jobController from '../controllers/job.controller';
import { Job } from '../models/job';
import { JobPosition } from '../models/jobPosition';
import { JobType } from '../models/jobType';
import { JobLocation } from '../models/jobLocation';

const router = Router();

router.get('/',[
    query('name').trim().custom((value, {req}) => {
        if (value) {
            const regex = /^[A-Za-z0-9\s]+$/; // Cho phép chữ, số và dấu cách
            if (!regex.test(value)) {
                throw new Error('Tên không được chứa ký tự đặc biệt trừ dấu cách');
            };
            return true;
        }
        return true;
    }),
    query('position').trim()
        .custom((value, {req}) => {  
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
        .custom((value, {req}) => {
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
        .custom((value, {req}) => {
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
        .custom((value, {req}) => {
            if (value) {
                const regex = /^[0-9]+$/; // Chỉ cho phép số
                if (!regex.test(value)) {
                    throw new Error('page không hợp lệ');
                };
                return true;
            }
            return true;
        }),
    query('limit').trim()
        .custom((value, {req}) => {
            if (value) {
                const regex = /^[0-9]+$/; // Chỉ cho phép số
                if (!regex.test(value)) {
                    throw new Error('limit không hợp lệ');
                };
                return true;
            }
            return true;
        }),
], jobController.getJobs);

router.get('/location', jobController.getLoc);
router.get('/position', jobController.getPos);
router.get('/type', jobController.getType);

router.get('/:jobId',
    param('jobId').trim().isMongoId().withMessage('Id không hợp lệ')
, jobController.getSingleJob);


export default router;