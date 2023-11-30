"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Project = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const projectSchema = new Schema({
    candidateId: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    name: String,
    description: String,
    url: String
}, {
    timestamps: true
});
exports.Project = mongoose_1.default.model('Project', projectSchema);
