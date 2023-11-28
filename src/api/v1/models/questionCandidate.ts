import mongoose from "mongoose";
const Schema = mongoose.Schema;

const questionCandidateSchema = new Schema({
    interviewId: {
        type: Schema.Types.ObjectId,
        ref: 'Interview',
        required: true
    },
    questionsId: [{
        type: Schema.Types.ObjectId,
        ref: 'Question',
    }],
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    score: Number,
    note: String
});

export const QuestionCandidate = mongoose.model('QuestionCandidate', questionCandidateSchema);