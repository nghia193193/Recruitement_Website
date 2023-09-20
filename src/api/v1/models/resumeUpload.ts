import mongoose from "mongoose";
const Schema = mongoose.Schema;

const resumeUploadSchema = new Schema({
    candidateId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    publicId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    resumeUpload: {
        type: String,
        required: true
    }
}, 
{
    timestamps: true
});

export const ResumeUpload = mongoose.model('ResumeUpload', resumeUploadSchema);
