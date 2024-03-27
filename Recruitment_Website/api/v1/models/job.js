"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Job = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const jobSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    position: {
        type: String,
        required: true
    },
    type: {
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
    skills: {
        type: Array,
        default: []
    }
}, {
    timestamps: true
});
jobSchema.statics.getJobDetail = async (jobId) => {
    const job = await exports.Job.findById(jobId).populate('authorId');
    if (!job) {
        throw http_errors_1.default.NotFound('Job not found');
    }
    return {
        jobId: job._id.toString(),
        name: job.name,
        quantity: job.quantity,
        benefit: job.benefit,
        salaryRange: job.salaryRange,
        requirement: job.requirement,
        description: job.description,
        author: job.authorId.name,
        position: job.position,
        location: job.location,
        jobType: job.type,
        skills: job.skills
    };
};
exports.Job = mongoose_1.default.model('Job', jobSchema);
