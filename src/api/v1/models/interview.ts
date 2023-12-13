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
        ref: 'Job',
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
    },
    authorId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
},{
    timestamps: true
});
    

export const Interview = mongoose.model('Interview', interviewSchema);
