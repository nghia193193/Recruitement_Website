import mongoose from "mongoose";
const Schema = mongoose.Schema;

const blackListSchema = new Schema(
    {
        candidateId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        reason: {
            type: String,
            required: true
        },
        date: {
            type: Date,
            required: true
        }
    }
);

export const BlackList = mongoose.model('BlackList', blackListSchema);
