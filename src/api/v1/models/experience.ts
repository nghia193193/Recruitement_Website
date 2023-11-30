import mongoose from "mongoose";
const Schema = mongoose.Schema;

const experienceSchema = new Schema(
    {
        candidateId: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        companyName: String,
        position: String,
        dateFrom: Date,
        dateTo: Date
    }, {
        timestamps: true
    }
);

export const Experience = mongoose.model('Experience', experienceSchema);
