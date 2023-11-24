"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterviewerInterview = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const interviewerInterviewSchema = new Schema({
    interviewersId: [
        {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    ],
    interviewId: {
        type: Schema.Types.ObjectId,
        ref: 'Interview',
        required: true
    }
}, {
    timestamps: true
});
exports.InterviewerInterview = mongoose_1.default.model('InterviewerInterview', interviewerInterviewSchema);
