"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Resume = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const resumeSchema = new Schema({
    candidateId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    education: {
        type: String,
        required: true
    },
    experience: {
        type: String,
        required: true
    },
    certificate: {
        type: String,
        required: true
    },
    prize: {
        type: String,
        required: true
    },
    course: {
        type: String,
        required: true
    },
    project: {
        type: String,
        required: true
    },
    socialActivity: {
        type: String,
        required: true
    },
    resumeUploadId: {
        type: Schema.Types.ObjectId,
        ref: 'ResumeUpload',
        required: true
    }
});
exports.Resume = mongoose_1.default.model('Resume', resumeSchema);
