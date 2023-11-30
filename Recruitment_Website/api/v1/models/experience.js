"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Experience = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const experienceSchema = new Schema({
    candidateId: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    companyName: String,
    position: String,
    dateFrom: Date,
    dateTo: Date
}, {
    timestamps: true
});
exports.Experience = mongoose_1.default.model('Experience', experienceSchema);
