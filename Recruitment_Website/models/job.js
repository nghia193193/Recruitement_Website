"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Job = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const jobSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    positionId: {
        type: Schema.Types.ObjectId,
        ref: 'JobPosition',
        required: true
    },
    jobType: {
        type: String,
        required: true
    },
    authorId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    benefit: {
        type: String,
        required: true
    },
    salaryRange: {
        type: String,
        required: true
    },
    requirement: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        required: true
    },
    deadline: {
        type: Date,
        required: true
    },
    skills: [
        {
            skillId: {
                type: Schema.Types.ObjectId,
                ref: 'Skill',
                required: true
            }
        }
    ]
}, {
    timestamps: true
});
exports.Job = mongoose_1.default.model('Job', jobSchema);
