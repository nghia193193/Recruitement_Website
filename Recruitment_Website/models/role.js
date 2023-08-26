"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Role = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const roleSchema = new Schema({
    roleName: {
        type: String,
        requried: true
    },
    isActive: {
        type: Boolean,
        required: true
    }
}, {
    timestamps: true
});
exports.Role = mongoose_1.default.model('Role', roleSchema);
