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
exports.getSingleJob = exports.getType = exports.getPosition = exports.getLocation = exports.getJobs = void 0;
const jobPosition_1 = require("../models/jobPosition");
const express_validator_1 = require("express-validator");
const jobLocation_1 = require("../models/jobLocation");
const jobType_1 = require("../models/jobType");
const jobService = __importStar(require("../services/job.service"));
const getJobs = async (req, res, next) => {
    try {
        const page = req.query.page ? +req.query.page : 1;
        const limit = req.query.limit ? +req.query.limit : 10;
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            const error = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = {
                content: []
            };
            throw error;
        }
        ;
        const query = {
            isActive: true,
            deadline: { $gt: new Date() }
        };
        if (req.query['name']) {
            query['name'] = new RegExp(req.query['name'], 'i');
        }
        ;
        if (req.query['type']) {
            const jobType = await jobType_1.JobType.findOne({ name: req.query['type'] });
            query['typeId'] = jobType?._id;
        }
        ;
        if (req.query['position']) {
            const jobPos = await jobPosition_1.JobPosition.findOne({ name: req.query['position'] });
            query['positionId'] = jobPos?._id;
        }
        ;
        if (req.query['location']) {
            const jobLoc = await jobLocation_1.JobLocation.findOne({ name: req.query['location'] });
            query['locationId'] = jobLoc?._id;
        }
        ;
        const { listjobs, jobLength } = await jobService.getJobs(query, page, limit);
        res.status(200).json({
            success: true, message: 'Successfully', statusCode: 200, result: {
                pageNumber: page,
                totalPages: Math.ceil(jobLength / limit),
                limit: limit,
                totalElements: jobLength,
                content: listjobs
            }
        });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        ;
        next(err);
    }
    ;
};
exports.getJobs = getJobs;
const getLocation = async (req, res, next) => {
    try {
        const listLocation = await jobService.getLocation();
        res.status(200).json({ success: true, message: 'Lấy list Location thành công', statusCode: 200, result: listLocation });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        ;
        next(err);
    }
    ;
};
exports.getLocation = getLocation;
const getPosition = async (req, res, next) => {
    try {
        const listPosition = await jobService.getPosition();
        res.status(200).json({ success: true, message: 'Lấy list Position thành công', statusCode: 200, result: listPosition });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        ;
        next(err);
    }
    ;
};
exports.getPosition = getPosition;
const getType = async (req, res, next) => {
    try {
        const listType = await jobService.getType();
        res.status(200).json({ success: true, message: 'Lấy list Type thành công', statusCode: 200, result: listType });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        ;
        next(err);
    }
    ;
};
exports.getType = getType;
const getSingleJob = async (req, res, next) => {
    try {
        const jobId = req.params.jobId;
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            const error = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        ;
        const returnJob = await jobService.getSingleJob(jobId);
        res.status(200).json({ success: true, message: 'Đã tìm thấy job', statusCode: 200, result: returnJob });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        ;
        next(err);
    }
    ;
};
exports.getSingleJob = getSingleJob;
