"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJobs = void 0;
const job_1 = require("../models/job");
const express_validator_1 = require("express-validator");
const getJobs = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const page = req.query.page ? +req.query.page : 1;
    const size = req.query.size ? +req.query.size : 10;
    const errors = (0, express_validator_1.validationResult)(req);
    try {
        if (!errors.isEmpty()) {
            const error = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = {
                type: "about:blank",
                title: "Bad request",
                instance: "/api/v1/jobs"
            };
            throw error;
        }
        const query = {};
        const optionalQuerys = ['name', 'type', 'location'];
        for (const q of optionalQuerys) {
            if (q === 'type') {
                if (req.query[q]) {
                    query['jobType'] = req.query[q];
                }
            }
            else {
                if (req.query[q]) {
                    query[q] = req.query[q];
                }
            }
        }
        ;
        // console.log(query);
        if (req.query.position) {
            const jobLength = yield job_1.Job.find(Object.assign(Object.assign({}, query), { 'position.name': req.query.position })).countDocuments();
            const jobs = yield job_1.Job.find(Object.assign(Object.assign({}, query), { 'position.name': req.query.position }))
                .skip((page - 1) * size)
                .limit(size);
            res.status(200).json({ success: true, message: 'Successfully', statusCode: 200, result: {
                    pageNumber: page,
                    totalPages: Math.ceil(jobLength / size),
                    pageSize: size,
                    totalElements: jobLength,
                    content: jobs
                } });
        }
        else {
            const jobLength = yield job_1.Job.find(query).countDocuments();
            const jobs = yield job_1.Job.find(query)
                .skip((page - 1) * size)
                .limit(size);
            res.status(200).json({ success: true, message: 'Successfully', statusCode: 200, result: {
                    pageNumber: page,
                    totalPages: Math.ceil(jobLength / size),
                    pageSize: size,
                    totalElements: jobLength,
                    content: jobs
                } });
        }
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
});
exports.getJobs = getJobs;
