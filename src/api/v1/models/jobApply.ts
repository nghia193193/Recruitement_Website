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
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    resumeId: {
        type: Schema.Types.ObjectId,
        ref: 'Resume',
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    note: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    }
});

export const JobApply = mongoose.model('JobApply', jobApplySchema);
