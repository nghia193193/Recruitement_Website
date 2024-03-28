import mongoose from "mongoose";
import { Education } from "./education";
import { Experience } from "./experience";
import { Certificate } from "./certificate";
import { Project } from "./project";
import createHttpError from "http-errors";
const Schema = mongoose.Schema;

const userSchema = new Schema(
    {
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
    },
    {
        timestamps: true
    }
);

userSchema.statics.getCandidateInfo = async (candidateId: string) => {
    const candidate = await User.findById(candidateId);
    if (!candidate) {
        throw(createHttpError.NotFound('Không tìm thấy ứng viên!'));
    }
    const educationList = await Education.find({ candidateId: candidateId });
    const returnEducationList = educationList.map(e => {
        return {
            school: e.school,
            major: e.major,
            graduatedYead: e.graduatedYear
        }
    })
    const experienceList = await Experience.find({ candidateId: candidateId });
    const returnExperienceList = experienceList.map(e => {
        return {
            companyName: e.companyName,
            position: e.position,
            dateFrom: e.dateFrom,
            dateTo: e.dateTo
        }
    })
    const certificateList = await Certificate.find({ candidateId: candidateId });
    const returnCertificateList = certificateList.map(c => {
        return {
            name: c.name,
            receivedDate: c.receivedDate,
            url: c.url
        }
    })
    const projectList = await Project.find({ candidateId: candidateId });
    const returnProjectList = projectList.map(p => {
        return {
            name: p.name,
            description: p.description,
            url: p.url
        }
    })
    let listSkill = candidate.skills.map((skill, index) => {
        return {
            label: skill,
            value: index
        }
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
    }
}

export const User = mongoose.model('User', userSchema);
