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
exports.createAccount = exports.removeBlackList = exports.addBlackList = exports.getAllBlackListAccounts = exports.getAllCandidateAccounts = exports.getAllInterviewerAccounts = exports.getAllRecruiterAccounts = exports.getAllAccounts = void 0;
const certificate_1 = require("../models/certificate");
const education_1 = require("../models/education");
const experience_1 = require("../models/experience");
const project_1 = require("../models/project");
const role_1 = require("../models/role");
const user_1 = require("../models/user");
const bcrypt = __importStar(require("bcryptjs"));
const getAllAccounts = async (adminId, searchText, searchBy, active, page, limit) => {
    const admin = await user_1.User.findById(adminId);
    if (!admin) {
        const error = new Error('UnAuthorized');
        error.statusCode = 401;
        error.result = {
            content: []
        };
        throw error;
    }
    let query = {
        isActive: active ? active : true
    };
    searchBy = searchBy ? searchBy : 'name';
    if (searchBy === 'role') {
        const roleId = await role_1.Role.findOne({ roleName: searchText });
        if (!roleId) {
            const error = new Error('Không tìm thấy role này');
            error.statusCode = 409;
            error.result = {
                content: []
            };
            throw error;
        }
        query['roleId'] = roleId;
    }
    else if (searchBy === 'name') {
        if (searchText) {
            query['fullName'] = new RegExp(searchText, 'i');
        }
    }
    else {
        if (searchText) {
            query[searchBy] = new RegExp(searchText, 'i');
        }
    }
    const accountLength = await user_1.User.find(query).countDocuments();
    if (accountLength === 0) {
        const error = new Error('Chưa có tài khoản nào');
        error.statusCode = 409;
        error.result = {
            content: []
        };
        throw error;
    }
    const listAccounts = await user_1.User.find(query)
        .populate('roleId skills.skillId')
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
    const returnListAccounts = async () => {
        const mappedAccounts = await Promise.all(listAccounts.map(async (account) => {
            try {
                const educationList = await education_1.Education.find({ candidateId: account._id.toString() });
                const returnEducationList = educationList.map(e => {
                    return {
                        school: e.school,
                        major: e.major,
                        graduatedYead: e.graduatedYear
                    };
                });
                const experienceList = await experience_1.Experience.find({ candidateId: account._id.toString() });
                const returnExperienceList = experienceList.map(e => {
                    return {
                        companyName: e.companyName,
                        position: e.position,
                        dateFrom: e.dateFrom,
                        dateTo: e.dateTo
                    };
                });
                const certificateList = await certificate_1.Certificate.find({ candidateId: account._id.toString() });
                const returnCertificateList = certificateList.map(c => {
                    return {
                        name: c.name,
                        receivedDate: c.receivedDate,
                        url: c.url
                    };
                });
                const projectList = await project_1.Project.find({ candidateId: account._id.toString() });
                const returnProjectList = projectList.map(p => {
                    return {
                        name: p.name,
                        description: p.description,
                        url: p.url
                    };
                });
                let listSkill = [];
                for (let i = 0; i < account.skills.length; i++) {
                    listSkill.push({ label: account.skills[i].skillId.name, value: i });
                }
                return {
                    accountId: account._id.toString(),
                    fullName: account.fullName,
                    role: account.get('roleId.roleName'),
                    createdDate: account.createdAt,
                    blackList: account.blackList,
                    avatar: account.avatar?.url,
                    about: account.about,
                    email: account.email,
                    dateOfBirth: account.dateOfBirth,
                    address: account.address,
                    phone: account.phone,
                    skills: listSkill,
                    information: {
                        education: returnEducationList,
                        experience: returnExperienceList,
                        certificate: returnCertificateList,
                        project: returnProjectList,
                        skills: listSkill
                    }
                };
            }
            catch (error) {
                console.error(error);
                return null;
            }
        }));
        return mappedAccounts.filter(account => account !== null);
    };
    const accounts = await returnListAccounts().then(mappedAccounts => {
        return mappedAccounts;
    });
    return { accountLength, accounts };
};
exports.getAllAccounts = getAllAccounts;
const getAllRecruiterAccounts = async (adminId, searchText, searchBy, active, page, limit) => {
    const admin = await user_1.User.findById(adminId);
    if (!admin) {
        const error = new Error('UnAuthorized');
        error.statusCode = 401;
        error.result = {
            content: []
        };
        throw error;
    }
    const roleId = await role_1.Role.findOne({ roleName: 'RECRUITER' });
    if (!roleId) {
        const error = new Error('Không tìm thấy role này');
        error.statusCode = 409;
        error.result = {
            content: []
        };
        throw error;
    }
    let query = {
        isActive: active ? active : true,
        roleId: roleId
    };
    searchBy = searchBy ? searchBy : 'name';
    if (searchBy === 'name') {
        if (searchText) {
            query['fullName'] = new RegExp(searchText, 'i');
        }
    }
    else {
        if (searchText) {
            query[searchBy] = new RegExp(searchText, 'i');
        }
    }
    const accountLength = await user_1.User.find(query).countDocuments();
    if (accountLength === 0) {
        const error = new Error('Chưa có tài khoản nào');
        error.statusCode = 409;
        error.result = {
            content: []
        };
        throw error;
    }
    const listAccounts = await user_1.User.find(query)
        .populate('roleId skills.skillId')
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
    const returnListAccounts = async () => {
        const mappedAccounts = await Promise.all(listAccounts.map(async (account) => {
            try {
                const educationList = await education_1.Education.find({ candidateId: account._id.toString() });
                const returnEducationList = educationList.map(e => {
                    return {
                        school: e.school,
                        major: e.major,
                        graduatedYead: e.graduatedYear
                    };
                });
                const experienceList = await experience_1.Experience.find({ candidateId: account._id.toString() });
                const returnExperienceList = experienceList.map(e => {
                    return {
                        companyName: e.companyName,
                        position: e.position,
                        dateFrom: e.dateFrom,
                        dateTo: e.dateTo
                    };
                });
                const certificateList = await certificate_1.Certificate.find({ candidateId: account._id.toString() });
                const returnCertificateList = certificateList.map(c => {
                    return {
                        name: c.name,
                        receivedDate: c.receivedDate,
                        url: c.url
                    };
                });
                const projectList = await project_1.Project.find({ candidateId: account._id.toString() });
                const returnProjectList = projectList.map(p => {
                    return {
                        name: p.name,
                        description: p.description,
                        url: p.url
                    };
                });
                let listSkill = [];
                for (let i = 0; i < account.skills.length; i++) {
                    listSkill.push({ label: account.skills[i].skillId.name, value: i });
                }
                return {
                    accountId: account._id.toString(),
                    fullName: account.fullName,
                    role: account.get('roleId.roleName'),
                    createdDate: account.createdAt,
                    blackList: account.blackList,
                    avatar: account.avatar?.url,
                    about: account.about,
                    email: account.email,
                    dateOfBirth: account.dateOfBirth,
                    address: account.address,
                    phone: account.phone,
                    skills: listSkill,
                    information: {
                        education: returnEducationList,
                        experience: returnExperienceList,
                        certificate: returnCertificateList,
                        project: returnProjectList,
                        skills: listSkill
                    }
                };
            }
            catch (error) {
                console.error(error);
                return null;
            }
        }));
        return mappedAccounts.filter(account => account !== null);
    };
    const accounts = await returnListAccounts().then(mappedAccounts => {
        return mappedAccounts;
    });
    return { accountLength, accounts };
};
exports.getAllRecruiterAccounts = getAllRecruiterAccounts;
const getAllInterviewerAccounts = async (adminId, searchText, searchBy, active, page, limit) => {
    const admin = await user_1.User.findById(adminId);
    if (!admin) {
        const error = new Error('UnAuthorized');
        error.statusCode = 401;
        error.result = {
            content: []
        };
        throw error;
    }
    const roleId = await role_1.Role.findOne({ roleName: 'INTERVIEWER' });
    if (!roleId) {
        const error = new Error('Không tìm thấy role này');
        error.statusCode = 409;
        error.result = {
            content: []
        };
        throw error;
    }
    let query = {
        isActive: active ? active : true,
        roleId: roleId
    };
    searchBy = searchBy ? searchBy : 'name';
    if (searchBy === 'name') {
        if (searchText) {
            query['fullName'] = new RegExp(searchText, 'i');
        }
    }
    else {
        if (searchText) {
            query[searchBy] = new RegExp(searchText, 'i');
        }
    }
    const accountLength = await user_1.User.find(query).countDocuments();
    if (accountLength === 0) {
        const error = new Error('Chưa có tài khoản nào');
        error.statusCode = 409;
        error.result = {
            content: []
        };
        throw error;
    }
    const listAccounts = await user_1.User.find(query)
        .populate('roleId skills.skillId')
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
    const returnListAccounts = async () => {
        const mappedAccounts = await Promise.all(listAccounts.map(async (account) => {
            try {
                const educationList = await education_1.Education.find({ candidateId: account._id.toString() });
                const returnEducationList = educationList.map(e => {
                    return {
                        school: e.school,
                        major: e.major,
                        graduatedYead: e.graduatedYear
                    };
                });
                const experienceList = await experience_1.Experience.find({ candidateId: account._id.toString() });
                const returnExperienceList = experienceList.map(e => {
                    return {
                        companyName: e.companyName,
                        position: e.position,
                        dateFrom: e.dateFrom,
                        dateTo: e.dateTo
                    };
                });
                const certificateList = await certificate_1.Certificate.find({ candidateId: account._id.toString() });
                const returnCertificateList = certificateList.map(c => {
                    return {
                        name: c.name,
                        receivedDate: c.receivedDate,
                        url: c.url
                    };
                });
                const projectList = await project_1.Project.find({ candidateId: account._id.toString() });
                const returnProjectList = projectList.map(p => {
                    return {
                        name: p.name,
                        description: p.description,
                        url: p.url
                    };
                });
                let listSkill = [];
                for (let i = 0; i < account.skills.length; i++) {
                    listSkill.push({ label: account.skills[i].skillId.name, value: i });
                }
                return {
                    accountId: account._id.toString(),
                    fullName: account.fullName,
                    role: account.get('roleId.roleName'),
                    createdDate: account.createdAt,
                    blackList: account.blackList,
                    avatar: account.avatar?.url,
                    about: account.about,
                    email: account.email,
                    dateOfBirth: account.dateOfBirth,
                    address: account.address,
                    phone: account.phone,
                    skills: listSkill,
                    information: {
                        education: returnEducationList,
                        experience: returnExperienceList,
                        certificate: returnCertificateList,
                        project: returnProjectList,
                        skills: listSkill
                    }
                };
            }
            catch (error) {
                console.error(error);
                return null;
            }
        }));
        return mappedAccounts.filter(account => account !== null);
    };
    const accounts = await returnListAccounts().then(mappedAccounts => {
        return mappedAccounts;
    });
    return { accountLength, accounts };
};
exports.getAllInterviewerAccounts = getAllInterviewerAccounts;
const getAllCandidateAccounts = async (adminId, searchText, searchBy, active, page, limit) => {
    const admin = await user_1.User.findById(adminId);
    if (!admin) {
        const error = new Error('UnAuthorized');
        error.statusCode = 401;
        error.result = {
            content: []
        };
        throw error;
    }
    const roleId = await role_1.Role.findOne({ roleName: 'CANDIDATE' });
    if (!roleId) {
        const error = new Error('Không tìm thấy role này');
        error.statusCode = 409;
        error.result = {
            content: []
        };
        throw error;
    }
    let query = {
        isActive: active ? active : true,
        roleId: roleId
    };
    searchBy = searchBy ? searchBy : 'name';
    if (searchBy === 'name') {
        if (searchText) {
            query['fullName'] = new RegExp(searchText, 'i');
        }
    }
    else {
        if (searchText) {
            query[searchBy] = new RegExp(searchText, 'i');
        }
    }
    const accountLength = await user_1.User.find(query).countDocuments();
    if (accountLength === 0) {
        const error = new Error('Chưa có tài khoản nào');
        error.statusCode = 409;
        error.result = {
            content: []
        };
        throw error;
    }
    const listAccounts = await user_1.User.find(query)
        .populate('roleId skills.skillId')
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
    const returnListAccounts = async () => {
        const mappedAccounts = await Promise.all(listAccounts.map(async (account) => {
            try {
                const educationList = await education_1.Education.find({ candidateId: account._id.toString() });
                const returnEducationList = educationList.map(e => {
                    return {
                        school: e.school,
                        major: e.major,
                        graduatedYead: e.graduatedYear
                    };
                });
                const experienceList = await experience_1.Experience.find({ candidateId: account._id.toString() });
                const returnExperienceList = experienceList.map(e => {
                    return {
                        companyName: e.companyName,
                        position: e.position,
                        dateFrom: e.dateFrom,
                        dateTo: e.dateTo
                    };
                });
                const certificateList = await certificate_1.Certificate.find({ candidateId: account._id.toString() });
                const returnCertificateList = certificateList.map(c => {
                    return {
                        name: c.name,
                        receivedDate: c.receivedDate,
                        url: c.url
                    };
                });
                const projectList = await project_1.Project.find({ candidateId: account._id.toString() });
                const returnProjectList = projectList.map(p => {
                    return {
                        name: p.name,
                        description: p.description,
                        url: p.url
                    };
                });
                let listSkill = [];
                for (let i = 0; i < account.skills.length; i++) {
                    listSkill.push({ label: account.skills[i].skillId.name, value: i });
                }
                return {
                    accountId: account._id.toString(),
                    fullName: account.fullName,
                    role: account.get('roleId.roleName'),
                    createdDate: account.createdAt,
                    blackList: account.blackList,
                    avatar: account.avatar?.url,
                    about: account.about,
                    email: account.email,
                    dateOfBirth: account.dateOfBirth,
                    address: account.address,
                    phone: account.phone,
                    skills: listSkill,
                    information: {
                        education: returnEducationList,
                        experience: returnExperienceList,
                        certificate: returnCertificateList,
                        project: returnProjectList,
                        skills: listSkill
                    }
                };
            }
            catch (error) {
                console.error(error);
                return null;
            }
        }));
        return mappedAccounts.filter(account => account !== null);
    };
    const accounts = await returnListAccounts().then(mappedAccounts => {
        return mappedAccounts;
    });
    return { accountLength, accounts };
};
exports.getAllCandidateAccounts = getAllCandidateAccounts;
const getAllBlackListAccounts = async (adminId, searchText, searchBy, active, page, limit) => {
    const admin = await user_1.User.findById(adminId);
    if (!admin) {
        const error = new Error('UnAuthorized');
        error.statusCode = 401;
        error.result = {
            content: []
        };
        throw error;
    }
    let query = {
        isActive: active ? active : true,
        blackList: true
    };
    searchBy = searchBy ? searchBy : 'name';
    if (searchBy === 'name') {
        if (searchText) {
            query['fullName'] = new RegExp(searchText, 'i');
        }
    }
    else {
        if (searchText) {
            query[searchBy] = new RegExp(searchText, 'i');
        }
    }
    const accountLength = await user_1.User.find(query).countDocuments();
    if (accountLength === 0) {
        const error = new Error('Chưa có tài khoản nào');
        error.statusCode = 409;
        error.result = {
            content: []
        };
        throw error;
    }
    const listAccounts = await user_1.User.find(query)
        .populate('roleId skills.skillId')
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
    const returnListAccounts = async () => {
        const mappedAccounts = await Promise.all(listAccounts.map(async (account) => {
            try {
                const educationList = await education_1.Education.find({ candidateId: account._id.toString() });
                const returnEducationList = educationList.map(e => {
                    return {
                        school: e.school,
                        major: e.major,
                        graduatedYead: e.graduatedYear
                    };
                });
                const experienceList = await experience_1.Experience.find({ candidateId: account._id.toString() });
                const returnExperienceList = experienceList.map(e => {
                    return {
                        companyName: e.companyName,
                        position: e.position,
                        dateFrom: e.dateFrom,
                        dateTo: e.dateTo
                    };
                });
                const certificateList = await certificate_1.Certificate.find({ candidateId: account._id.toString() });
                const returnCertificateList = certificateList.map(c => {
                    return {
                        name: c.name,
                        receivedDate: c.receivedDate,
                        url: c.url
                    };
                });
                const projectList = await project_1.Project.find({ candidateId: account._id.toString() });
                const returnProjectList = projectList.map(p => {
                    return {
                        name: p.name,
                        description: p.description,
                        url: p.url
                    };
                });
                let listSkill = [];
                for (let i = 0; i < account.skills.length; i++) {
                    listSkill.push({ label: account.skills[i].skillId.name, value: i });
                }
                return {
                    accountId: account._id.toString(),
                    fullName: account.fullName,
                    role: account.get('roleId.roleName'),
                    createdDate: account.createdAt,
                    blackList: account.blackList,
                    avatar: account.avatar?.url,
                    about: account.about,
                    email: account.email,
                    dateOfBirth: account.dateOfBirth,
                    address: account.address,
                    phone: account.phone,
                    skills: listSkill,
                    information: {
                        education: returnEducationList,
                        experience: returnExperienceList,
                        certificate: returnCertificateList,
                        project: returnProjectList,
                        skills: listSkill
                    }
                };
            }
            catch (error) {
                console.error(error);
                return null;
            }
        }));
        return mappedAccounts.filter(account => account !== null);
    };
    const accounts = await returnListAccounts().then(mappedAccounts => {
        return mappedAccounts;
    });
    return { accountLength, accounts };
};
exports.getAllBlackListAccounts = getAllBlackListAccounts;
const addBlackList = async (adminId, userId) => {
    const admin = await user_1.User.findById(adminId);
    if (!admin) {
        const error = new Error('UnAuthorized');
        error.statusCode = 401;
        error.result = {
            content: []
        };
        throw error;
    }
    const account = await user_1.User.findById(userId);
    if (!account) {
        const error = new Error('Không tìm thấy tài khoản');
        error.statusCode = 409;
        error.result = {
            content: []
        };
        throw error;
    }
    account.blackList = true;
    await account.save();
};
exports.addBlackList = addBlackList;
const removeBlackList = async (adminId, candidateId) => {
    const admin = await user_1.User.findById(adminId);
    if (!admin) {
        const error = new Error('UnAuthorized');
        error.statusCode = 401;
        error.result = {
            content: []
        };
        throw error;
    }
    const account = await user_1.User.findById(candidateId);
    if (!account) {
        const error = new Error('Không tìm thấy tài khoản');
        error.statusCode = 409;
        error.result = {
            content: []
        };
        throw error;
    }
    account.blackList = false;
    await account.save();
};
exports.removeBlackList = removeBlackList;
const createAccount = async (adminId, fullName, email, password, phone, position) => {
    const admin = await user_1.User.findById(adminId);
    if (!admin) {
        const error = new Error('UnAuthorized');
        error.statusCode = 401;
        error.result = null;
        throw error;
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const roleId = await role_1.Role.findOne({ roleName: position, isActive: true });
    if (!roleId) {
        const error = new Error('Không tìm thấy role này');
        error.statusCode = 409;
        error.result = null;
        throw error;
    }
    const user = new user_1.User({
        fullName: fullName,
        email: email,
        password: hashedPassword,
        phone: phone,
        roleId: roleId,
        isActive: true,
        isVerifiedEmail: true,
        blackList: false
    });
    await user.save();
};
exports.createAccount = createAccount;
