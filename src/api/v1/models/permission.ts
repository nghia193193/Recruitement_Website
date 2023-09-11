import mongoose from "mongoose";
const Schema = mongoose.Schema;

const permissionSchema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        isActive: {
            type: Boolean,
            required: true
        }
    },
    {
        timestamps: true
    }
);

export const Permission = mongoose.model('Permission', permissionSchema);