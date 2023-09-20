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
const job_1 = require("../models/job");
const jobPosition_1 = require("../models/jobPosition");
const router = (0, express_1.Router)();
router.get('/', [
    (0, express_validator_1.query)('name').trim(),
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
            return job_1.Job.findOne({ jobType: value })
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
            return job_1.Job.findOne({ location: value })
                .then(job => {
                if (!job) {
                    return Promise.reject(`Failed to convert 'location' with value: '${value}'`);
                }
                return true;
            });
        }
        return true;
    }),
], jobController.getJobs);
router.get('/location', jobController.getLoc);
router.get('/position', jobController.getPos);
router.get('/type', jobController.getType);
router.get('/:jobId', (0, express_validator_1.param)('jobId').trim().isMongoId().withMessage('Id không hợp lệ'), jobController.getSingleJob);
exports.default = router;
