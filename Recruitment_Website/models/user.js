"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const userSchema = new Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    gender: String,
    roleId: {
        type: String,
        ref: "Role",
    },
    avatar: String,
    isVerifiedEmail: Boolean,
    address: String,
    dateOfBirth: Date,
    about: String,
    isActive: Boolean,
    information: String,
    otp: String,
}, {
    timestamps: true
});
exports.User = mongoose_1.default.model('User', userSchema);
