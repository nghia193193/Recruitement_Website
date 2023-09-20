import mongoose from "mongoose";
const Schema = mongoose.Schema;

const resumeUploadSchema = new Schema({
    publicId: {
        type: String,
        required: true
    },
    linkResumeUpload: {
        type: String,
        required: true
    }
}, 
{
    timestamps: true
});

export const ResumeUpload = mongoose.model('ResumeUpload', resumeUploadSchema);
