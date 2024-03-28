"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const education_1 = require("./education");
const experience_1 = require("./experience");
const certificate_1 = require("./certificate");
const project_1 = require("./project");
const http_errors_1 = __importDefault(require("http-errors"));
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
        type: Schema.Types.ObjectId,
        ref: "Role",
    },
    avatar: {
        publicId: String,
        url: String
    },
    skills: {
        type: Array,
        default: []
    },
    blackList: Boolean,
    isVerifiedEmail: Boolean,
    address: String,
    dateOfBirth: Date,
    about: String,
    isActive: Boolean,
    information: String,
    resetToken: String,
    resetTokenExpired: Date,
    otp: String,
    otpExpired: Date,
}, {
    timestamps: true
});
userSchema.statics.getCandidateInfo = async (candidateId) => {
    const candidate = await exports.User.findById(candidateId);
    if (!candidate) {
        throw (http_errors_1.default.NotFound('Không tìm thấy ứng viên!'));
    }
    const educationList = await education_1.Education.find({ candidateId: candidateId });
    const returnEducationList = educationList.map(e => {
        return {
            school: e.school,
            major: e.major,
            graduatedYead: e.graduatedYear
        };
    });
    const experienceList = await experience_1.Experience.find({ candidateId: candidateId });
    const returnExperienceList = experienceList.map(e => {
        return {
            companyName: e.companyName,
            position: e.position,
            dateFrom: e.dateFrom,
            dateTo: e.dateTo
        };
    });
    const certificateList = await certificate_1.Certificate.find({ candidateId: candidateId });
    const returnCertificateList = certificateList.map(c => {
        return {
            name: c.name,
            receivedDate: c.receivedDate,
            url: c.url
        };
    });
    const projectList = await project_1.Project.find({ candidateId: candidateId });
    const returnProjectList = projectList.map(p => {
        return {
            name: p.name,
            description: p.description,
            url: p.url
        };
    });
    let listSkill = candidate.skills.map((skill, index) => {
        return {
            label: skill,
            value: index
        };
    });
    return {
        candidateId: candidate._id.toString(),
        fullName: candidate.fullName,
        avatar: candidate.avatar?.url,
        address: candidate.address,
        about: candidate.about,
        dateOfBirth: candidate.dateOfBirth,
        phone: candidate.phone,
        email: candidate.email,
        information: {
            education: returnEducationList,
            experience: returnExperienceList,
            certificate: returnCertificateList,
            project: returnProjectList,
            skills: listSkill
        }
    };
};
exports.User = mongoose_1.default.model('User', userSchema);
