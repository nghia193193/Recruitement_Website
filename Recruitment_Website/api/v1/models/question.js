"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Question = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const questionSchema = new Schema({
    interviewerId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    note: String,
    typeQuestion: {
        type: String,
        required: true
    },
    skillId: {
        type: Schema.Types.ObjectId,
        ref: 'Skill',
        required: true
    }
}, {
    timestamps: true
});
exports.Question = mongoose_1.default.model('Question', questionSchema);
