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

export interface EventInterface {
    eventId: string;
    title: string;
    name: string;
    description: string;
    img: string | null;
    author: string;
    linkContacts: {
        Instagram: string
        LinkedIn: string
        Twitter: string
        Facebook: string
        Gitlab: string
    };
    startAt: string;
    deadline: string;
    time: string;
    location: string;
};

export const Event = mongoose.model('Event', eventSchema);