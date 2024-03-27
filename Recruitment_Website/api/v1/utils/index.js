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
exports.addFractionStrings = exports.createICalEvent = exports.formatDateToJSDateObject = exports.isValidTimeFormat = exports.isPDF = exports.verifyRefreshToken = exports.verifyAccessToken = exports.signRefreshToken = exports.signAccessToken = exports.questionType = exports.applyStatus = exports.skills = exports.jobType = exports.jobPosition = exports.jobLocation = exports.refreshKey = exports.secretKey = void 0;
const jwt = __importStar(require("jsonwebtoken"));
const http_errors_1 = __importDefault(require("http-errors"));
const redis_config_1 = require("../../../config/redis.config");
exports.secretKey = process.env.JWT_SECRET_KEY;
exports.refreshKey = process.env.JWT_REFRESH_KEY;
exports.jobLocation = ['FTOWN1', 'FTOWN2', 'FTOWN3'];
exports.jobPosition = ['FRONTEND', 'BACKEND', 'FULLSTACK', 'DEVOPS', 'TESTER', 'ANDROID'];
exports.jobType = ['PART_TIME', 'FULL_TIME', 'REMOTE'];
exports.skills = [
    'Java', 'Python', 'C#', 'C++', 'PHP', 'JavaScript', 'Node.js', 'React.js', 'TypeScript',
    'GraphQL', 'Next.js', 'Tailwind CSS', 'REST APIs', 'CSS', 'HTML', 'Back-End Development', 'Front-End Development',
    'AWS', 'CICD', 'DevOps', 'SQL', 'NoSQL', 'API Testing', 'Software Testing', 'Test Cases', 'Test Data', 'Test Planning',
    'Test Scripts', 'Communication', 'Consultation', 'Negotiation', 'Optimization', 'Problem Solving',
];
exports.applyStatus = ['PENDING', 'REVIEWING', 'PASS', 'FAIL'];
exports.questionType = ['Technical', 'SoftSkill', 'English'];
const signAccessToken = async (userId) => {
    return new Promise((resole, reject) => {
        const payload = {
            userId
        };
        const options = {
            expiresIn: '1h'
        };
        jwt.sign(payload, exports.secretKey, options, (err, token) => {
            if (err)
                reject(err);
            resole(token);
        });
    });
};
exports.signAccessToken = signAccessToken;
const signRefreshToken = async (userId) => {
    return new Promise((resolve, reject) => {
        const payload = {
            userId
        };
        const options = {
            expiresIn: '1y'
        };
        jwt.sign(payload, exports.refreshKey, options, async (err, token) => {
            if (err)
                return reject(err);
            try {
                const key = userId.toString();
                const value = token;
                await redis_config_1.client.set(key, value, { EX: 365 * 24 * 60 * 60 });
                resolve(token);
            }
            catch (error) {
                console.log(error);
                reject(error);
            }
        });
    });
};
exports.signRefreshToken = signRefreshToken;
async function verifyAccessToken(accessToken) {
    return new Promise((resolve, reject) => {
        jwt.verify(accessToken, exports.secretKey, (err, decoded) => {
            if (err) {
                // invalid error,...
                if (err.name === 'JsonWebTokenError') {
                    return reject(http_errors_1.default.Unauthorized());
                }
                // token expired error
                return reject(http_errors_1.default.Unauthorized(err.message));
            }
            else {
                resolve(decoded);
            }
        });
    });
}
exports.verifyAccessToken = verifyAccessToken;
;
async function verifyRefreshToken(refreshToken) {
    return new Promise((resolve, reject) => {
        jwt.verify(refreshToken, exports.refreshKey, async (err, decoded) => {
            if (err) {
                // invalid error,...
                if (err.name === 'JsonWebTokenError') {
                    return reject(http_errors_1.default.Unauthorized());
                }
                // token expired error
                return reject(http_errors_1.default.Unauthorized(err.message));
            }
            const storedRT = await redis_config_1.client.get(decoded.userId);
            if (storedRT !== refreshToken) {
                return reject(http_errors_1.default.Unauthorized());
            }
            resolve(decoded);
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
