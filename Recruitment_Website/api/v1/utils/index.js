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
exports.addFractionStrings = exports.createICalEvent = exports.formatDateToJSDateObject = exports.isValidTimeFormat = exports.isPDF = exports.verifyRefreshToken = exports.verifyToken = exports.transporter = exports.questionType = exports.applyStatus = exports.refreshKey = exports.secretKey = void 0;
const jwt = __importStar(require("jsonwebtoken"));
const nodemailer = __importStar(require("nodemailer"));
exports.secretKey = 'nghiatrongrecruitementwebsitenam42023secretkey';
exports.refreshKey = 'nghiatrongrecruitementwebsitenam42023refreshkey';
exports.applyStatus = ['PENDING', 'REVIEWING', 'PASS', 'FAIL'];
exports.questionType = ['Technical', 'SoftSkill', 'English'];
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
function formatDateToJSDateObject(inputDate) {
    const options = {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        timeZoneName: 'short',
    };
    const vietnameseDate = inputDate.toLocaleString('vi-VN', options);
    return vietnameseDate;
}
exports.formatDateToJSDateObject = formatDateToJSDateObject;
function createICalEvent(startTime, endTime, attendees) {
    const startISOString = startTime.toISOString();
    const endISOString = endTime.toISOString();
    const attendeesString = attendees.map(attendee => `ATTENDEE:${attendee}`).join('\r\n');
    const iCalString = `
      BEGIN:VCALENDAR
      VERSION:2.0
      BEGIN:VEVENT
      DTSTART:${startISOString}
      DTEND:${endISOString}
      ${attendeesString}
      END:VEVENT
      END:VCALENDAR
  `;
    return iCalString;
}
exports.createICalEvent = createICalEvent;
function addFractionStrings(x1, x2) {
    const [numerator1, denominator1] = x1.split('/').map(Number);
    const [numerator2, denominator2] = x2.split('/').map(Number);
    const newNumerator = numerator1 + numerator2;
    const newDenominator = denominator1 + denominator2;
    return `${newNumerator}/${newDenominator}`;
}
exports.addFractionStrings = addFractionStrings;
