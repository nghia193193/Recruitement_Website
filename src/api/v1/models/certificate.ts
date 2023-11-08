import mongoose from "mongoose";
const Schema = mongoose.Schema;

const certificateSchema = new Schema(
    {
        candidateId: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        name: String,
        receivedDate: Date,
        url: String
    }
);

export const Certificate = mongoose.model('Certificate', certificateSchema);
