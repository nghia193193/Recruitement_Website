import mongoose from "mongoose";
const Schema = mongoose.Schema;

const projectSchema = new Schema(
    {
        candidateId: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        name: String,
        description: String,
        url: String
    }
);

export const Project = mongoose.model('Project', projectSchema);
