import mongoose from "mongoose";
const Schema = mongoose.Schema;

const skillSchema = new Schema({
    authorId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    }
});

export const Skill = mongoose.model('Skill', skillSchema);