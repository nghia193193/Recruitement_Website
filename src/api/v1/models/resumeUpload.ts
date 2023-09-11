import mongoose from "mongoose";
const Schema = mongoose.Schema;

const resumeUploadSchema = new Schema({
    linkResumeUpload: {
        type: String,
        required: true
    }
});

export const ResumeUpload = mongoose.model('ResumeUpload', resumeUploadSchema);
