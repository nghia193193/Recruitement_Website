"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionCandidate = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const questionCandidateSchema = new Schema({
    interviewId: {
        type: Schema.Types.ObjectId,
        ref: 'Interview',
        required: true
    },
    questionsId: [{
            type: Schema.Types.ObjectId,
            ref: 'Question',
        }],
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    score: Number,
    note: String
});
exports.QuestionCandidate = mongoose_1.default.model('QuestionCandidate', questionCandidateSchema);
