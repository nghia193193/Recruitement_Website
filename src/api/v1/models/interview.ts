import mongoose from "mongoose";
const Schema = mongoose.Schema;

const interviewSchema = new Schema({
    candidateId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    jobApplyId: {
        type: Schema.Types.ObjectId,
        ref: 'JobApply',
        required: true
    },
    time: {
        type: Date,
        required: true
    },
    interviewLink: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    }
},{
    timestamps: true
});
    

export const Interview = mongoose.model('Interview', interviewSchema);
