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
const express_validator_1 = require("express-validator");
const jobController = __importStar(require("../controllers/job.controller"));
const jobPosition_1 = require("../models/jobPosition");
const jobType_1 = require("../models/jobType");
const jobLocation_1 = require("../models/jobLocation");
const router = (0, express_1.Router)();
router.get('/', [
    (0, express_validator_1.query)('name').trim().custom((value, { req }) => {
        if (value) {
            const regex = /^[A-Za-z0-9\s]+$/; // Cho phép chữ, số và dấu cách
            if (!regex.test(value)) {
                throw new Error('Tên không được chứa ký tự đặc biệt trừ dấu cách');
            }
            ;
            return true;
        }
        return true;
    }),
    (0, express_validator_1.query)('position').trim()
        .custom((value, { req }) => {
        if (value) {
            return jobPosition_1.JobPosition.findOne({ name: value })
                .then(jobPos => {
                if (!jobPos) {
                    return Promise.reject(`Failed to convert 'position' with value: '${value}'`);
                }
                return true;
            });
        }
        return true;
    }),
    (0, express_validator_1.query)('type').trim()
        .custom((value, { req }) => {
        if (value) {
            return jobType_1.JobType.findOne({ name: value })
                .then(job => {
                if (!job) {
                    return Promise.reject(`Failed to convert 'type' with value: '${value}'`);
                }
                return true;
            });
        }
        return true;
    }),
    (0, express_validator_1.query)('location').trim()
        .custom((value, { req }) => {
        if (value) {
            return jobLocation_1.JobLocation.findOne({ name: value })
                .then(job => {
                if (!job) {
                    return Promise.reject(`Failed to convert 'location' with value: '${value}'`);
                }
                return true;
            });
        }
        return true;
    }),
    (0, express_validator_1.query)('page').trim()
        .custom((value, { req }) => {
        if (value) {
            const regex = /^[0-9]+$/; // Chỉ cho phép số
            if (!regex.test(value)) {
                throw new Error('page không hợp lệ');
            }
            ;
            return true;
        }
        return true;
    }),
    (0, express_validator_1.query)('limit').trim()
        .custom((value, { req }) => {
        if (value) {
            const regex = /^[0-9]+$/; // Chỉ cho phép số
            if (!regex.test(value)) {
                throw new Error('limit không hợp lệ');
            }
            ;
            return true;
        }
        return true;
    }),
], jobController.GetJobs);
router.get('/location', jobController.GetLocation);
router.get('/position', jobController.GetPosition);
router.get('/type', jobController.GetType);
router.get('/:jobId', (0, express_validator_1.param)('jobId').trim().isMongoId().withMessage('Id không hợp lệ'), jobController.GetSingleJob);
exports.default = router;
