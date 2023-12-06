"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminController = __importStar(require("../controllers/admin.controller"));
const middleware_1 = require("../middleware");
const express_validator_1 = require("express-validator");
const router = (0, express_1.Router)();
router.get('/users', middleware_1.isAuth, [
    (0, express_validator_1.query)('page').trim()
        .custom((value, { req }) => {
        if (value) {
            const regex = /^[0-9]+$/;
            if (!regex.test(value)) {
                throw new Error('page không hợp lệ');
            }
            ;
            const intValue = parseInt(value, 10);
            if (isNaN(intValue) || intValue <= 0) {
                throw new Error('page phải là số nguyên lớn hơn 0');
            }
        }
        return true;
    }),
    (0, express_validator_1.query)('limit').trim()
        .custom((value, { req }) => {
        if (value) {
            const regex = /^[0-9]+$/;
            if (!regex.test(value)) {
                throw new Error('limit không hợp lệ');
            }
            ;
            const intValue = parseInt(value, 10);
            if (isNaN(intValue) || intValue <= 0) {
                throw new Error('limit phải là số nguyên lớn hơn 0');
            }
        }
        return true;
    }),
], adminController.getAllAccounts);
router.get('/users/:userId', middleware_1.isAuth, [
    (0, express_validator_1.param)('userId').trim().isMongoId().withMessage('userId không hợp lệ')
], adminController.getSingleAccount);
router.get('/users/recruiter', middleware_1.isAuth, [
    (0, express_validator_1.query)('page').trim()
        .custom((value, { req }) => {
        if (value) {
            const regex = /^[0-9]+$/;
            if (!regex.test(value)) {
                throw new Error('page không hợp lệ');
            }
            ;
            const intValue = parseInt(value, 10);
            if (isNaN(intValue) || intValue <= 0) {
                throw new Error('page phải là số nguyên lớn hơn 0');
            }
        }
        return true;
    }),
    (0, express_validator_1.query)('limit').trim()
        .custom((value, { req }) => {
        if (value) {
            const regex = /^[0-9]+$/;
            if (!regex.test(value)) {
                throw new Error('limit không hợp lệ');
            }
            ;
            const intValue = parseInt(value, 10);
            if (isNaN(intValue) || intValue <= 0) {
                throw new Error('limit phải là số nguyên lớn hơn 0');
            }
        }
        return true;
    }),
], adminController.getAllRecruiterAccounts);
router.get('/users/interviewer', middleware_1.isAuth, [
    (0, express_validator_1.query)('page').trim()
        .custom((value, { req }) => {
        if (value) {
            const regex = /^[0-9]+$/;
            if (!regex.test(value)) {
                throw new Error('page không hợp lệ');
            }
            ;
            const intValue = parseInt(value, 10);
            if (isNaN(intValue) || intValue <= 0) {
                throw new Error('page phải là số nguyên lớn hơn 0');
            }
        }
        return true;
    }),
    (0, express_validator_1.query)('limit').trim()
        .custom((value, { req }) => {
        if (value) {
            const regex = /^[0-9]+$/;
            if (!regex.test(value)) {
                throw new Error('limit không hợp lệ');
            }
            ;
            const intValue = parseInt(value, 10);
            if (isNaN(intValue) || intValue <= 0) {
                throw new Error('limit phải là số nguyên lớn hơn 0');
            }
        }
        return true;
    }),
], adminController.getAllInterviewerAccounts);
router.get('/users/candidate', middleware_1.isAuth, [
    (0, express_validator_1.query)('page').trim()
        .custom((value, { req }) => {
        if (value) {
            const regex = /^[0-9]+$/;
            if (!regex.test(value)) {
                throw new Error('page không hợp lệ');
            }
            ;
            const intValue = parseInt(value, 10);
            if (isNaN(intValue) || intValue <= 0) {
                throw new Error('page phải là số nguyên lớn hơn 0');
            }
        }
        return true;
    }),
    (0, express_validator_1.query)('limit').trim()
        .custom((value, { req }) => {
        if (value) {
            const regex = /^[0-9]+$/;
            if (!regex.test(value)) {
                throw new Error('limit không hợp lệ');
            }
            ;
            const intValue = parseInt(value, 10);
            if (isNaN(intValue) || intValue <= 0) {
                throw new Error('limit phải là số nguyên lớn hơn 0');
            }
        }
        return true;
    }),
], adminController.getAllCandidateAccounts);
router.get('/users/blacklist', middleware_1.isAuth, [
    (0, express_validator_1.query)('page').trim()
        .custom((value, { req }) => {
        if (value) {
            const regex = /^[0-9]+$/;
            if (!regex.test(value)) {
                throw new Error('page không hợp lệ');
            }
            ;
            const intValue = parseInt(value, 10);
            if (isNaN(intValue) || intValue <= 0) {
                throw new Error('page phải là số nguyên lớn hơn 0');
            }
        }
        return true;
    }),
    (0, express_validator_1.query)('limit').trim()
        .custom((value, { req }) => {
        if (value) {
            const regex = /^[0-9]+$/;
            if (!regex.test(value)) {
                throw new Error('limit không hợp lệ');
            }
            ;
            const intValue = parseInt(value, 10);
            if (isNaN(intValue) || intValue <= 0) {
                throw new Error('limit phải là số nguyên lớn hơn 0');
            }
        }
        return true;
    }),
], adminController.getAllBlackListAccounts);
exports.default = router;
