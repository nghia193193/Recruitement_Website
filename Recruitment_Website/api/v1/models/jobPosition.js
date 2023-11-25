"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobPosition = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const jobPosSchema = new Schema({
    name: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});
exports.JobPosition = mongoose_1.default.model('JobPosition', jobPosSchema);
