import mongoose from "mongoose";
const Schema = mongoose.Schema;

const interviewerInterviewSchema = new Schema({
    interviewerId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    interviewId: {
        type: Schema.Types.ObjectId,
        ref: 'Interview',
        required: true
    }
});
    

export const InterviewerInterview = mongoose.model('InterviewerInterview', interviewerInterviewSchema);
