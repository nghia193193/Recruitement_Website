import mongoose from "mongoose";
const Schema = mongoose.Schema;

const roleSchema = new Schema(
    {
        roleName: {
            type: String,
            requried: true
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

export const Role = mongoose.model('Role', roleSchema);