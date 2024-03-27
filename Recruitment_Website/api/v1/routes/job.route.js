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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const jobController = __importStar(require("../controllers/job.controller"));
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
], jobController.getJobs);
router.get('/location', jobController.getLocation);
router.get('/position', jobController.getPosition);
router.get('/type', jobController.getType);
router.get('/:jobId', (0, express_validator_1.param)('jobId').trim().isMongoId().withMessage('Id không hợp lệ'), jobController.getSingleJob);
exports.default = router;
