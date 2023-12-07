import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';
import { isAuth } from '../middleware';
import { param, query } from 'express-validator';

const router = Router();

router.get('/users',isAuth, [
    query('page').trim()
        .custom((value, { req }) => {
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
        .custom((value, { req }) => {
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
], adminController.getAllAccounts);

router.get('/users/recruiter',isAuth, [
    query('page').trim()
        .custom((value, { req }) => {
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
        .custom((value, { req }) => {
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
], adminController.getAllRecruiterAccounts);

router.get('/users/interviewer',isAuth, [
    query('page').trim()
        .custom((value, { req }) => {
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
        .custom((value, { req }) => {
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
], adminController.getAllInterviewerAccounts);

router.get('/users/candidate',isAuth, [
    query('page').trim()
        .custom((value, { req }) => {
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
        .custom((value, { req }) => {
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
], adminController.getAllCandidateAccounts);

router.get('/users/blacklist',isAuth, [
    query('page').trim()
        .custom((value, { req }) => {
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
        .custom((value, { req }) => {
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
], adminController.getAllBlackListAccounts);

router.post('/users/blacklist/:userId',isAuth, [
    param('userId').trim().isMongoId().withMessage('userId không hợp lệ')
], adminController.addBlackList);

router.delete('/candidate/:candidateId',isAuth, [
    param('candidateId').trim().isMongoId().withMessage('candidateId không hợp lệ')
], adminController.removeBlackList);

export default router