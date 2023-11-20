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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckRoleRecruiter = exports.isValidTimeFormat = exports.isPDF = exports.verifyRefreshToken = exports.verifyToken = exports.transporter = exports.clientSecret = exports.tenantId = exports.clientId = exports.ApplyStatus = exports.refreshKey = exports.secretKey = void 0;
const jwt = __importStar(require("jsonwebtoken"));
const nodemailer = __importStar(require("nodemailer"));
exports.secretKey = 'nghiatrongrecruitementwebsitenam42023secretkey';
exports.refreshKey = 'nghiatrongrecruitementwebsitenam42023refreshkey';
exports.ApplyStatus = ['PENDING', 'REVIEWING', 'INTERVIEWING', 'COMPLETED'];
exports.clientId = '242ba16c-6922-4303-956c-7b3c7dd9d073';
exports.tenantId = '2220568f-d40f-476e-9dd6-191edfe35999';
exports.clientSecret = 'PVO8Q~iWfVi7WzJht1YB.rqM9glrCgoupLGR7b~D';
exports.transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
});
async function verifyToken(accessToken) {
    return new Promise((resolve, reject) => {
        jwt.verify(accessToken, exports.secretKey, (err, decoded) => {
            if (err) {
                console.log(err);
                const error = new Error('Invalid or expired access token');
                error.statusCode = 401;
                throw error;
            }
            else {
                resolve(decoded);
            }
        });
    });
}
exports.verifyToken = verifyToken;
;
async function verifyRefreshToken(refreshToken) {
    return new Promise((resolve, reject) => {
        jwt.verify(refreshToken, exports.refreshKey, (err, decoded) => {
            if (err) {
                console.log(err);
                const error = new Error('Invalid or expired refresh token');
                error.statusCode = 401;
                throw error;
            }
            else {
                resolve(decoded);
            }
        });
    });
}
exports.verifyRefreshToken = verifyRefreshToken;
;
const isPDF = function isPDF(file) {
    const allowedExtensions = ['.pdf'];
    const fileExtension = (file.name || '').toLowerCase().split('.').pop();
    return allowedExtensions.includes(`.${fileExtension}`);
};
exports.isPDF = isPDF;
function isValidTimeFormat(timeString) {
    const timePattern = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timePattern.test(timeString);
}
exports.isValidTimeFormat = isValidTimeFormat;
function CheckRoleRecruiter() {
}
exports.CheckRoleRecruiter = CheckRoleRecruiter;
