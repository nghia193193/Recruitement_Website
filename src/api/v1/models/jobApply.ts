import mongoose from "mongoose";
const Schema = mongoose.Schema;

const jobApplySchema = new Schema({
    jobAppliedId: {
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
        ref: 'ResumeUpload',
        required: true
    },
    status: {
        type: String,
        required: true
    },
    authorId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    }
},{
    timestamps: true
});

export const JobApply = mongoose.model('JobApply', jobApplySchema);
