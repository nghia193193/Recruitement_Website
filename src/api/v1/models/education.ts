import mongoose from "mongoose";
const Schema = mongoose.Schema;

const educationSchema = new Schema(
    {
        candidateId: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        school: String,
        major: String,
        graduatedYear: String
    }, {
        timestamps: true
    }
);

export const Education = mongoose.model('Education', educationSchema);
