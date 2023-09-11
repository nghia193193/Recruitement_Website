"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobApply = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const jobApplySchema = new Schema({
    jobId: {
        type: Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    candidateId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    resumeId: {
        type: Schema.Types.ObjectId,
        ref: 'Resume',
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    note: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    }
});
exports.JobApply = mongoose_1.default.model('JobApply', jobApplySchema);
