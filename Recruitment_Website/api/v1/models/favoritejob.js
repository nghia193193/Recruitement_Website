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
exports.FavoriteJob = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const mongoose_1 = __importStar(require("mongoose"));
const user_1 = require("./user");
const job_1 = require("./job");
const favoriteJobSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.default.Schema.ObjectId,
        required: true,
        ref: 'User'
    },
    favoriteJobs: {
        type: Array,
        default: []
    }
});
favoriteJobSchema.statics.getFavoriteJob = async function (candidateId) {
    const candidate = await user_1.User.findById(candidateId).populate('roleId');
    if (!candidate) {
        throw http_errors_1.default.NotFound('User not existed!');
    }
    if (candidate?.get('roleId.roleName') !== 'CANDIDATE') {
        throw http_errors_1.default.Unauthorized();
    }
    const favoriteJob = await this.findOne({ userId: candidateId });
    if (!favoriteJob) {
        const error = new Error("Your favorite job list is empty");
        error.success = true;
        error.result = {
            content: []
        };
        throw new Error();
    }
    const mappedFavoriteJobs = await Promise.all(favoriteJob.favoriteJobs.map(async (jobId) => {
        return await job_1.Job.getJobDetail(jobId);
    }));
    return mappedFavoriteJobs;
};
exports.FavoriteJob = mongoose_1.default.model('FavoriteJob', favoriteJobSchema);
