import { Router } from 'express';
import { body, query, param } from 'express-validator';
import * as jobController from '../controllers/job';
import { Job } from '../models/job';
import { JobPosition } from '../models/jobPosition';

const router = Router();

router.get('/api/v1/jobs',[
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

router.get('/api/v1/jobs/location', jobController.getLoc);
router.get('/api/v1/jobs/position', jobController.getPos);
router.get('/api/v1/jobs/type', jobController.getType);

router.get('/api/v1/jobs/:jobId',
    param('jobId').trim().isMongoId().withMessage('Id không hợp lệ')
, jobController.getSingleJob);


export default router;