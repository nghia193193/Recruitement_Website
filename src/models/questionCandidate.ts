import mongoose from "mongoose";
const Schema = mongoose.Schema;

const questionCandidateSchema = new Schema({
    interviewId: {
        type: Schema.Types.ObjectId,
        ref: 'Interview',
        required: true
    },
    questionId: {
        type: Schema.Types.ObjectId,
        ref: 'Question',
        required: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    score: {
        type: Number,
        required: true
    },
    note: {
        type: String,
        required: true
    }
});

export const QuestionCandidate = mongoose.model('QuestionCandidate', questionCandidateSchema);