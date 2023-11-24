import mongoose from "mongoose";
const Schema = mongoose.Schema;

const interviewerInterviewSchema = new Schema({
    interviewersId: [
        {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    ],
    interviewId: {
        type: Schema.Types.ObjectId,
        ref: 'Interview',
        required: true
    }
},{
    timestamps: true
});
    

export const InterviewerInterview = mongoose.model('InterviewerInterview', interviewerInterviewSchema);
