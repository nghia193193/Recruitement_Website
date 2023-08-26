import mongoose from "mongoose";
const Schema = mongoose.Schema;

const jobSchema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        jobPosId: {
            type: Schema.Types.ObjectId,
            ref: 'JobPosition',
            required: true
        },
        jobType: {
            type: String,
            required: true
        },
        recruiterId: {
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
        desc: {
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
        }
    },
    {
        timestamps: true
    }
);

export const Job = mongoose.model('Job', jobSchema);