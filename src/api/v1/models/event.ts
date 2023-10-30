import mongoose from "mongoose";
const Schema = mongoose.Schema

const eventSchema = new Schema(
    {
        authorId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        title: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        time: {
            type: String,
            required: true
        },
        image: {
            publicId: String,
            url: String
        },
        isActive: {
            type: Boolean,
            required: true
        },
        location: {
            type: String,
            required: true
        },
        deadline: {
            type: Date,
            required: true
        },
        startAt: {
            type: Date,
            required: true
        }
    },
    {
        timestamps: true
    }
);

export const Event = mongoose.model('Event', eventSchema);