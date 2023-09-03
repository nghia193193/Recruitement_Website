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
const jobController = __importStar(require("../controllers/job"));
const job_1 = require("../models/job");
const router = (0, express_1.Router)();
router.get('/api/v1/jobs', [
    (0, express_validator_1.query)('name').trim(),
    (0, express_validator_1.query)('position').trim()
        .custom((value, { req }) => {
        if (value) {
            return job_1.Job.findOne({ 'position.name': value })
                .then(job => {
                if (!job) {
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
router.get('/api/v1/jobs/location', jobController.getLoc);
router.get('/api/v1/jobs/position', jobController.getPos);
router.get('/api/v1/jobs/type', jobController.getType);
router.get('/api/v1/jobs/:jobId', jobController.getSingleJob);
exports.default = router;
