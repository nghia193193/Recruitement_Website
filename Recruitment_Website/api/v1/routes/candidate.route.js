"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const candidateController = __importStar(require("../controllers/candidate.controller"));
const middleware_1 = require("../middleware");
const express_validator_1 = require("express-validator");
const mongoose_1 = __importDefault(require("mongoose"));
const router = (0, express_1.Router)();
router.get('/resumes', middleware_1.isAuth, candidateController.getResumes);
router.put('/resumes', middleware_1.isAuth, candidateController.uploadResume);
router.delete('/resumes/:resumeId', middleware_1.isAuth, (0, express_validator_1.param)('resumeId').trim().custom((value, { req }) => {
    if (!mongoose_1.default.Types.ObjectId.isValid(value)) {
        throw new Error('Id không hợp lệ');
    }
    return true;
}), candidateController.deleteResume);
exports.default = router;
