"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobSkill = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const jobSkillSchema = new Schema({
    jobId: {
        type: Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    skillId: {
        type: Schema.Types.ObjectId,
        ref: 'Skill',
        required: true
    }
});
exports.JobSkill = mongoose_1.default.model('JobSkill', jobSkillSchema);
