import mongoose from "mongoose";
const Schema = mongoose.Schema;

const jobApplySchema = new Schema({
    jobId: {
        type: Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    candidateId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    resumeId: {
        type: Schema.Types.ObjectId,
        ref: 'Resume',
        required: true
    },
    note: String,
    status: {
        type: Number,
        required: true
    }
});

export const JobApply = mongoose.model('JobApply', jobApplySchema);
