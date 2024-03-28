"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const job_controller_1 = require("../controllers/job.controller");
const utils_1 = require("../utils");
const sanitize_html_1 = __importDefault(require("sanitize-html"));
const router = (0, express_1.Router)();
router.get('/', [
    (0, express_validator_1.query)('name').trim()
        .customSanitizer((value) => {
        if (value) {
            const sanitizedValue = (0, sanitize_html_1.default)(value);
            return sanitizedValue;
        }
    }),
    (0, express_validator_1.query)('position').trim()
        .custom((value, { req }) => {
        if (value) {
            if (!utils_1.jobPosition.includes(value)) {
                throw new Error(`Failed to convert 'position' with value: '${value}'`);
            }
        }
        return true;
    }),
    (0, express_validator_1.query)('type').trim()
        .custom((value, { req }) => {
        if (value) {
            if (!utils_1.jobType.includes(value)) {
                throw new Error(`Failed to convert 'position' with value: '${value}'`);
            }
        }
        return true;
    }),
    (0, express_validator_1.query)('location').trim()
        .custom((value, { req }) => {
        if (value) {
            if (!utils_1.jobLocation.includes(value)) {
                throw new Error(`Failed to convert 'position' with value: '${value}'`);
            }
        }
        return true;
    }),
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
], job_controller_1.jobController.getJobs);
router.get('/location', job_controller_1.jobController.getLocation);
router.get('/position', job_controller_1.jobController.getPosition);
router.get('/type', job_controller_1.jobController.getType);
router.get('/:jobId', (0, express_validator_1.param)('jobId').trim().isMongoId().withMessage('Id không hợp lệ'), job_controller_1.jobController.getSingleJob);
exports.default = router;
