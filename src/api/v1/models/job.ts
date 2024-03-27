import createHttpError from "http-errors";
import mongoose from "mongoose";
const Schema = mongoose.Schema;

const jobSchema = new Schema(
    {
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
    },
    {
        timestamps: true
    }
);

jobSchema.statics.getJobDetail = async (jobId) => {
    const job = await Job.findById(jobId).populate('authorId');
    if (!job) {
        throw createHttpError.NotFound('Job not found');
    }
    return {
        jobId: job._id.toString(),
        name: job.name,
        quantity: job.quantity,
        benefit: job.benefit,
        salaryRange: job.salaryRange,
        requirement: job.requirement,
        description: job.description,
        author: (job.authorId as any).name,
        position: job.position,
        location: job.location,
        jobType: job.type,
        skills: job.skills
    }
}

export const Job = mongoose.model('Job', jobSchema);