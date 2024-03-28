import mongoose from "mongoose";
const Schema = mongoose.Schema;

const questionSchema = new Schema({
    interviewerId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    note: String,
    typeQuestion: {
        type: String,
        required: true
    },
    skill: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

export const Question = mongoose.model('Question', questionSchema);