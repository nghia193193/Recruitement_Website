import { Router } from 'express';
import { body, query, param } from 'express-validator';
import * as jobController from '../controllers/job.controller';
import { Job } from '../models/job';
import { JobPosition } from '../models/jobPosition';

const router = Router();

router.get('/',[
    query('name').trim(),
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
                return Job.findOne({jobType: value})
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
                return Job.findOne({location: value})
                    .then(job => {
                        if (!job) {
                            return Promise.reject(`Failed to convert 'location' with value: '${value}'`)
                        }
                        return true
                    })
            }
            return true
        }),
], jobController.getJobs);

router.get('/location', jobController.getLoc);
router.get('/position', jobController.getPos);
router.get('/type', jobController.getType);

router.get('/:jobId',
    param('jobId').trim().isMongoId().withMessage('Id không hợp lệ')
, jobController.getSingleJob);


export default router;