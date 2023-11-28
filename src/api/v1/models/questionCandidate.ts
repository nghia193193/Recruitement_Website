import mongoose from "mongoose";
const Schema = mongoose.Schema;

const questionCandidateSchema = new Schema({
    interviewId: {
        type: Schema.Types.ObjectId,
        ref: 'Interview',
        required: true
    },
    questions: [{
        questionId: {
            type: Schema.Types.ObjectId,
            ref: 'Question'
        },
        score: Number,
        note: String
    }],
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

export const QuestionCandidate = mongoose.model('QuestionCandidate', questionCandidateSchema);