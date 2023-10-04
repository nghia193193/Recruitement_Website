"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobType = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const jobTypeSchema = new Schema({
    name: {
        type: String,
        required: true
    }
});
exports.JobType = mongoose_1.default.model('JobType', jobTypeSchema);
