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
    note: {
        type: String,
        required: true
    },
    typeQuestion: {
        type: String,
        required: true
    },
    skillId: {
        type: Schema.Types.ObjectId,
        ref: 'Skill',
        required: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
});

export const Question = mongoose.model('Question', questionSchema);