"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileConfig = void 0;
const express_fileupload_1 = __importDefault(require("express-fileupload"));
exports.fileConfig = (0, express_fileupload_1.default)({
    useTempFiles: true,
    tempFileDir: '/tmp/',
    limits: { fileSize: 5 * 1024 * 1024 },
    safeFileNames: true,
    abortOnLimit: true,
    responseOnLimit: 'File size limit has been reached (5MB)',
    preserveExtension: true,
});
