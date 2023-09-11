import mongoose from "mongoose";
const Schema = mongoose.Schema;

const resumeSchema = new Schema({
    candiateId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    education: {
        type: String,
        required: true
    },
    experience: {
        type: String,
        required: true
    },
    certificate: {
        type: String,
        required: true
    },
    prize: {
        type: String,
        required: true
    },
    course: {
        type: String,
        required: true
    },
    project: {
        type: String, 
        required: true
    },
    socialActivity: {
        type: String, 
        required: true
    },
    resumeUploadId: {
        type: Schema.Types.ObjectId,
        ref: 'ResumeUpload',
        required: true
    }
});

export const Resume = mongoose.model('Resume', resumeSchema);
