"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobController = void 0;
const express_validator_1 = require("express-validator");
const job_service_1 = require("../services/job.service");
exports.jobController = {
    getJobs: async (req, res, next) => {
        try {
            const page = req.query.page ? +req.query.page : 1;
            const limit = req.query.limit ? +req.query.limit : 10;
            const errors = (0, express_validator_1.validationResult)(req);
            const { name, type, position, location } = req.query;
            if (!errors.isEmpty()) {
                const error = new Error(errors.array()[0].msg);
                error.statusCode = 400;
                error.result = {
                    content: []
                };
                throw error;
            }
            ;
            const { listjobs, jobLength } = await job_service_1.jobService.getJobs(name, type, position, location, page, limit);
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
    },
    getLocation: async (req, res, next) => {
        try {
            const listLocation = job_service_1.jobService.getLocation();
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
    },
    getPosition: async (req, res, next) => {
        try {
            const listPosition = job_service_1.jobService.getPosition();
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
    },
    getType: async (req, res, next) => {
        try {
            const listType = job_service_1.jobService.getType();
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
    },
    getSingleJob: async (req, res, next) => {
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
            const returnJob = await job_service_1.jobService.getSingleJob(jobId);
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
    }
};
