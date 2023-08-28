"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResumeUpload = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const resumeUploadSchema = new Schema({
    linkResumeUpload: {
        type: String,
        required: true
    }
});
exports.ResumeUpload = mongoose_1.default.model('ResumeUpload', resumeUploadSchema);
