"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllBlackListAccounts = exports.getAllCandidateAccounts = exports.getAllInterviewerAccounts = exports.getAllRecruiterAccounts = exports.getSingleAccount = exports.getAllAccounts = void 0;
const certificate_1 = require("../models/certificate");
const education_1 = require("../models/education");
const experience_1 = require("../models/experience");
const project_1 = require("../models/project");
const role_1 = require("../models/role");
const user_1 = require("../models/user");
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
        .populate('roleId')
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
    const returnListAccounts = listAccounts.map(account => {
        return {
            accountId: account._id.toString(),
            accountFullName: account.fullName,
            accountRole: account.get('roleId.roleName'),
            accountPhone: account.phone,
            accountEmail: account.email,
            createdDate: account.createdAt,
        };
    });
    return { accountLength, returnListAccounts };
};
exports.getAllAccounts = getAllAccounts;
const getSingleAccount = async (adminId, accountId) => {
    const admin = await user_1.User.findById(adminId);
    if (!admin) {
        const error = new Error('UnAuthorized');
        error.statusCode = 401;
        error.result = {
            content: []
        };
        throw error;
    }
    const account = await user_1.User.findById(accountId).populate('roleId skills.skillId');
    if (!account) {
        const error = new Error('Không tìm thấy tài khoản');
        error.statusCode = 401;
        error.result = {
            content: []
        };
        throw error;
    }
    const educationList = await education_1.Education.find({ candidateId: accountId });
    const returnEducationList = educationList.map(e => {
        return {
            school: e.school,
            major: e.major,
            graduatedYead: e.graduatedYear
        };
    });
    const experienceList = await experience_1.Experience.find({ candidateId: accountId });
    const returnExperienceList = experienceList.map(e => {
        return {
            companyName: e.companyName,
            position: e.position,
            dateFrom: e.dateFrom,
            dateTo: e.dateTo
        };
    });
    const certificateList = await certificate_1.Certificate.find({ candidateId: accountId });
    const returnCertificateList = certificateList.map(c => {
        return {
            name: c.name,
            receivedDate: c.receivedDate,
            url: c.url
        };
    });
    const projectList = await project_1.Project.find({ candidateId: accountId });
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
    const returnAccount = {
        fullName: account.fullName,
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
    return { returnAccount };
};
exports.getSingleAccount = getSingleAccount;
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
        .populate('roleId')
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
    const returnListAccounts = listAccounts.map(account => {
        return {
            accountId: account._id.toString(),
            accountFullName: account.fullName,
            accountRole: account.get('roleId.roleName'),
            accountPhone: account.phone,
            accountEmail: account.email,
            createdDate: account.createdAt,
        };
    });
    return { accountLength, returnListAccounts };
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
        .populate('roleId')
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
    const returnListAccounts = listAccounts.map(account => {
        return {
            accountId: account._id.toString(),
            accountFullName: account.fullName,
            accountRole: account.get('roleId.roleName'),
            accountPhone: account.phone,
            accountEmail: account.email,
            createdDate: account.createdAt,
        };
    });
    return { accountLength, returnListAccounts };
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
        .populate('roleId')
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
    const returnListAccounts = listAccounts.map(account => {
        return {
            accountId: account._id.toString(),
            accountFullName: account.fullName,
            accountRole: account.get('roleId.roleName'),
            accountPhone: account.phone,
            accountEmail: account.email,
            createdDate: account.createdAt,
        };
    });
    return { accountLength, returnListAccounts };
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
        .populate('roleId')
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
    const returnListAccounts = listAccounts.map(account => {
        return {
            accountId: account._id.toString(),
            accountFullName: account.fullName,
            accountRole: account.get('roleId.roleName'),
            accountPhone: account.phone,
            accountEmail: account.email,
            createdDate: account.createdAt,
        };
    });
    return { accountLength, returnListAccounts };
};
exports.getAllBlackListAccounts = getAllBlackListAccounts;
