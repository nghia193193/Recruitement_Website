"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Certificate = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const certificateSchema = new Schema({
    candidateId: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    name: String,
    receivedDate: Date,
    url: String
});
exports.Certificate = mongoose_1.default.model('Certificate', certificateSchema);
