import mongoose from "mongoose";
const Schema = mongoose.Schema

const eventSchema = new Schema(
    {
        recruiterId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        time: {
            type: Date,
            required: true
        },
        img: {
            type: String,
            required: true
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
        }
    },
    {
        timestamps: true
    }
);

export const Event = mongoose.model('Event', eventSchema);