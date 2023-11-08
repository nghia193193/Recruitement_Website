"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Education = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const educationSchema = new Schema({
    candidateId: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    school: String,
    major: String,
    graduatedYear: String
});
exports.Education = mongoose_1.default.model('Education', educationSchema);
