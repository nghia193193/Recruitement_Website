import { Certificate } from "../models/certificate";
import { Education } from "../models/education";
import { Experience } from "../models/experience";
import { Project } from "../models/project";
import { Role } from "../models/role";
import { User } from "../models/user";
import * as bcrypt from 'bcryptjs';

export const getAllAccounts = async (adminId: string, searchText: any, searchBy: any, active: any, page: number, limit: number) => {
    const admin = await User.findById(adminId);
    if (!admin) {
        const error: Error & { statusCode?: number, result?: any } = new Error('UnAuthorized');
        error.statusCode = 401;
        error.result = {
            content: []
        };
        throw error;
    }
    let query: any = {
        isActive: active ? active : true
    };
    searchBy = searchBy ? searchBy : 'name';
    if (searchBy === 'role') {
        const roleId = await Role.findOne({ roleName: searchText })
        if (!roleId) {
            const error: Error & { statusCode?: number, result?: any } = new Error('Không tìm thấy role này');
            error.statusCode = 409;
            error.result = {
                content: []
            };
            throw error;
        }
        query['roleId'] = roleId;
    } else if (searchBy === 'name') {
        if (searchText) {
            query['fullName'] = new RegExp(searchText, 'i');
        }
    } else {
        if (searchText) {
            query[searchBy] = new RegExp(searchText, 'i');
        }
    }
    const accountLength = await User.find(query).countDocuments();
    if (accountLength === 0) {
        const error: Error & { statusCode?: number, result?: any } = new Error('Chưa có tài khoản nào');
        error.statusCode = 409;
        error.result = {
            content: []
        };
        throw error;
    }
    const listAccounts = await User.find(query)
        .populate('roleId skills.skillId')
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)

    const returnListAccounts = async () => {
        const mappedAccounts = await Promise.all(
            listAccounts.map(async (account) => {
                try {
                    const educationList = await Education.find({ candidateId: account._id.toString() });
                    const returnEducationList = educationList.map(e => {
                        return {
                            school: e.school,
                            major: e.major,
                            graduatedYead: e.graduatedYear
                        }

                    })
                    const experienceList = await Experience.find({ candidateId: account._id.toString() });
                    const returnExperienceList = experienceList.map(e => {
                        return {
                            companyName: e.companyName,
                            position: e.position,
                            dateFrom: e.dateFrom,
                            dateTo: e.dateTo
                        }
                    })
                    const certificateList = await Certificate.find({ candidateId: account._id.toString() });
                    const returnCertificateList = certificateList.map(c => {
                        return {
                            name: c.name,
                            receivedDate: c.receivedDate,
                            url: c.url
                        }
                    })
                    const projectList = await Project.find({ candidateId: account._id.toString() });
                    const returnProjectList = projectList.map(p => {
                        return {
                            name: p.name,
                            description: p.description,
                            url: p.url
                        }
                    })
                    let listSkill = [];
                    for (let i = 0; i < account.skills.length; i++) {
                        listSkill.push({ label: (account.skills[i].skillId as any).name, value: i });
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
                    }
                } catch (error) {
                    console.error(error);
                    return null;
                }
            })

        )
        return mappedAccounts.filter(account => account !== null);
    }
    const accounts = await returnListAccounts().then(mappedAccounts => {
        return mappedAccounts
    })
    return { accountLength, accounts };
};

export const getAllRecruiterAccounts = async (adminId: string, searchText: any, searchBy: any, active: any, page: number, limit: number) => {
    const admin = await User.findById(adminId);
    if (!admin) {
        const error: Error & { statusCode?: number, result?: any } = new Error('UnAuthorized');
        error.statusCode = 401;
        error.result = {
            content: []
        };
        throw error;
    }
    const roleId = await Role.findOne({ roleName: 'RECRUITER' })
    if (!roleId) {
        const error: Error & { statusCode?: number, result?: any } = new Error('Không tìm thấy role này');
        error.statusCode = 409;
        error.result = {
            content: []
        };
        throw error;
    }
    let query: any = {
        isActive: active ? active : true,
        roleId: roleId
    };
    searchBy = searchBy ? searchBy : 'name';
    if (searchBy === 'name') {
        if (searchText) {
            query['fullName'] = new RegExp(searchText, 'i');
        }
    } else {
        if (searchText) {
            query[searchBy] = new RegExp(searchText, 'i');
        }
    }
    const accountLength = await User.find(query).countDocuments();
    if (accountLength === 0) {
        const error: Error & { statusCode?: number, result?: any } = new Error('Chưa có tài khoản nào');
        error.statusCode = 409;
        error.result = {
            content: []
        };
        throw error;
    }
    const listAccounts = await User.find(query)
        .populate('roleId skills.skillId')
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)

    const returnListAccounts = async () => {
        const mappedAccounts = await Promise.all(
            listAccounts.map(async (account) => {
                try {
                    const educationList = await Education.find({ candidateId: account._id.toString() });
                    const returnEducationList = educationList.map(e => {
                        return {
                            school: e.school,
                            major: e.major,
                            graduatedYead: e.graduatedYear
                        }

                    })
                    const experienceList = await Experience.find({ candidateId: account._id.toString() });
                    const returnExperienceList = experienceList.map(e => {
                        return {
                            companyName: e.companyName,
                            position: e.position,
                            dateFrom: e.dateFrom,
                            dateTo: e.dateTo
                        }
                    })
                    const certificateList = await Certificate.find({ candidateId: account._id.toString() });
                    const returnCertificateList = certificateList.map(c => {
                        return {
                            name: c.name,
                            receivedDate: c.receivedDate,
                            url: c.url
                        }
                    })
                    const projectList = await Project.find({ candidateId: account._id.toString() });
                    const returnProjectList = projectList.map(p => {
                        return {
                            name: p.name,
                            description: p.description,
                            url: p.url
                        }
                    })
                    let listSkill = [];
                    for (let i = 0; i < account.skills.length; i++) {
                        listSkill.push({ label: (account.skills[i].skillId as any).name, value: i });
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
                    }
                } catch (error) {
                    console.error(error);
                    return null;
                }
            })

        )
        return mappedAccounts.filter(account => account !== null);
    }
    const accounts = await returnListAccounts().then(mappedAccounts => {
        return mappedAccounts
    })
    return { accountLength, accounts };
};

export const getAllInterviewerAccounts = async (adminId: string, searchText: any, searchBy: any, active: any, page: number, limit: number) => {
    const admin = await User.findById(adminId);
    if (!admin) {
        const error: Error & { statusCode?: number, result?: any } = new Error('UnAuthorized');
        error.statusCode = 401;
        error.result = {
            content: []
        };
        throw error;
    }
    const roleId = await Role.findOne({ roleName: 'INTERVIEWER' })
    if (!roleId) {
        const error: Error & { statusCode?: number, result?: any } = new Error('Không tìm thấy role này');
        error.statusCode = 409;
        error.result = {
            content: []
        };
        throw error;
    }
    let query: any = {
        isActive: active ? active : true,
        roleId: roleId
    };
    searchBy = searchBy ? searchBy : 'name';
    if (searchBy === 'name') {
        if (searchText) {
            query['fullName'] = new RegExp(searchText, 'i');
        }
    } else {
        if (searchText) {
            query[searchBy] = new RegExp(searchText, 'i');
        }
    }
    const accountLength = await User.find(query).countDocuments();
    if (accountLength === 0) {
        const error: Error & { statusCode?: number, result?: any } = new Error('Chưa có tài khoản nào');
        error.statusCode = 409;
        error.result = {
            content: []
        };
        throw error;
    }
    const listAccounts = await User.find(query)
        .populate('roleId skills.skillId')
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)

    const returnListAccounts = async () => {
        const mappedAccounts = await Promise.all(
            listAccounts.map(async (account) => {
                try {
                    const educationList = await Education.find({ candidateId: account._id.toString() });
                    const returnEducationList = educationList.map(e => {
                        return {
                            school: e.school,
                            major: e.major,
                            graduatedYead: e.graduatedYear
                        }

                    })
                    const experienceList = await Experience.find({ candidateId: account._id.toString() });
                    const returnExperienceList = experienceList.map(e => {
                        return {
                            companyName: e.companyName,
                            position: e.position,
                            dateFrom: e.dateFrom,
                            dateTo: e.dateTo
                        }
                    })
                    const certificateList = await Certificate.find({ candidateId: account._id.toString() });
                    const returnCertificateList = certificateList.map(c => {
                        return {
                            name: c.name,
                            receivedDate: c.receivedDate,
                            url: c.url
                        }
                    })
                    const projectList = await Project.find({ candidateId: account._id.toString() });
                    const returnProjectList = projectList.map(p => {
                        return {
                            name: p.name,
                            description: p.description,
                            url: p.url
                        }
                    })
                    let listSkill = [];
                    for (let i = 0; i < account.skills.length; i++) {
                        listSkill.push({ label: (account.skills[i].skillId as any).name, value: i });
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
                    }
                } catch (error) {
                    console.error(error);
                    return null;
                }
            })

        )
        return mappedAccounts.filter(account => account !== null);
    }
    const accounts = await returnListAccounts().then(mappedAccounts => {
        return mappedAccounts
    })
    return { accountLength, accounts };
};

export const getAllCandidateAccounts = async (adminId: string, searchText: any, searchBy: any, active: any, page: number, limit: number) => {
    const admin = await User.findById(adminId);
    if (!admin) {
        const error: Error & { statusCode?: number, result?: any } = new Error('UnAuthorized');
        error.statusCode = 401;
        error.result = {
            content: []
        };
        throw error;
    }
    const roleId = await Role.findOne({ roleName: 'CANDIDATE' })
    if (!roleId) {
        const error: Error & { statusCode?: number, result?: any } = new Error('Không tìm thấy role này');
        error.statusCode = 409;
        error.result = {
            content: []
        };
        throw error;
    }
    let query: any = {
        isActive: active ? active : true,
        roleId: roleId
    };
    searchBy = searchBy ? searchBy : 'name';
    if (searchBy === 'name') {
        if (searchText) {
            query['fullName'] = new RegExp(searchText, 'i');
        }
    } else {
        if (searchText) {
            query[searchBy] = new RegExp(searchText, 'i');
        }
    }
    const accountLength = await User.find(query).countDocuments();
    if (accountLength === 0) {
        const error: Error & { statusCode?: number, result?: any } = new Error('Chưa có tài khoản nào');
        error.statusCode = 409;
        error.result = {
            content: []
        };
        throw error;
    }
    const listAccounts = await User.find(query)
        .populate('roleId skills.skillId')
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)

    const returnListAccounts = async () => {
        const mappedAccounts = await Promise.all(
            listAccounts.map(async (account) => {
                try {
                    const educationList = await Education.find({ candidateId: account._id.toString() });
                    const returnEducationList = educationList.map(e => {
                        return {
                            school: e.school,
                            major: e.major,
                            graduatedYead: e.graduatedYear
                        }

                    })
                    const experienceList = await Experience.find({ candidateId: account._id.toString() });
                    const returnExperienceList = experienceList.map(e => {
                        return {
                            companyName: e.companyName,
                            position: e.position,
                            dateFrom: e.dateFrom,
                            dateTo: e.dateTo
                        }
                    })
                    const certificateList = await Certificate.find({ candidateId: account._id.toString() });
                    const returnCertificateList = certificateList.map(c => {
                        return {
                            name: c.name,
                            receivedDate: c.receivedDate,
                            url: c.url
                        }
                    })
                    const projectList = await Project.find({ candidateId: account._id.toString() });
                    const returnProjectList = projectList.map(p => {
                        return {
                            name: p.name,
                            description: p.description,
                            url: p.url
                        }
                    })
                    let listSkill = [];
                    for (let i = 0; i < account.skills.length; i++) {
                        listSkill.push({ label: (account.skills[i].skillId as any).name, value: i });
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
                    }
                } catch (error) {
                    console.error(error);
                    return null;
                }
            })

        )
        return mappedAccounts.filter(account => account !== null);
    }
    const accounts = await returnListAccounts().then(mappedAccounts => {
        return mappedAccounts
    })
    return { accountLength, accounts };
};

export const getAllBlackListAccounts = async (adminId: string, searchText: any, searchBy: any, active: any, page: number, limit: number) => {
    const admin = await User.findById(adminId);
    if (!admin) {
        const error: Error & { statusCode?: number, result?: any } = new Error('UnAuthorized');
        error.statusCode = 401;
        error.result = {
            content: []
        };
        throw error;
    }
    let query: any = {
        isActive: active ? active : true,
        blackList: true
    };
    searchBy = searchBy ? searchBy : 'name';
    if (searchBy === 'name') {
        if (searchText) {
            query['fullName'] = new RegExp(searchText, 'i');
        }
    } else {
        if (searchText) {
            query[searchBy] = new RegExp(searchText, 'i');
        }
    }
    const accountLength = await User.find(query).countDocuments();
    if (accountLength === 0) {
        const error: Error & { statusCode?: number, result?: any } = new Error('Chưa có tài khoản nào');
        error.statusCode = 409;
        error.result = {
            content: []
        };
        throw error;
    }
    const listAccounts = await User.find(query)
        .populate('roleId skills.skillId')
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)

    const returnListAccounts = async () => {
        const mappedAccounts = await Promise.all(
            listAccounts.map(async (account) => {
                try {
                    const educationList = await Education.find({ candidateId: account._id.toString() });
                    const returnEducationList = educationList.map(e => {
                        return {
                            school: e.school,
                            major: e.major,
                            graduatedYead: e.graduatedYear
                        }

                    })
                    const experienceList = await Experience.find({ candidateId: account._id.toString() });
                    const returnExperienceList = experienceList.map(e => {
                        return {
                            companyName: e.companyName,
                            position: e.position,
                            dateFrom: e.dateFrom,
                            dateTo: e.dateTo
                        }
                    })
                    const certificateList = await Certificate.find({ candidateId: account._id.toString() });
                    const returnCertificateList = certificateList.map(c => {
                        return {
                            name: c.name,
                            receivedDate: c.receivedDate,
                            url: c.url
                        }
                    })
                    const projectList = await Project.find({ candidateId: account._id.toString() });
                    const returnProjectList = projectList.map(p => {
                        return {
                            name: p.name,
                            description: p.description,
                            url: p.url
                        }
                    })
                    let listSkill = [];
                    for (let i = 0; i < account.skills.length; i++) {
                        listSkill.push({ label: (account.skills[i].skillId as any).name, value: i });
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
                    }
                } catch (error) {
                    console.error(error);
                    return null;
                }
            })

        )
        return mappedAccounts.filter(account => account !== null);
    }
    const accounts = await returnListAccounts().then(mappedAccounts => {
        return mappedAccounts
    })
    return { accountLength, accounts };
};

export const addBlackList = async (adminId: string, userId: string) => {
    const admin = await User.findById(adminId);
    if (!admin) {
        const error: Error & { statusCode?: number, result?: any } = new Error('UnAuthorized');
        error.statusCode = 401;
        error.result = {
            content: []
        };
        throw error;
    }
    const account = await User.findById(userId);
    if (!account) {
        const error: Error & { statusCode?: number, result?: any } = new Error('Không tìm thấy tài khoản');
        error.statusCode = 409;
        error.result = {
            content: []
        };
        throw error;
    }
    account.blackList = true;
    await account.save();
};

export const removeBlackList = async (adminId: string, candidateId: string) => {
    const admin = await User.findById(adminId);
    if (!admin) {
        const error: Error & { statusCode?: number, result?: any } = new Error('UnAuthorized');
        error.statusCode = 401;
        error.result = {
            content: []
        };
        throw error;
    }
    const account = await User.findById(candidateId);
    if (!account) {
        const error: Error & { statusCode?: number, result?: any } = new Error('Không tìm thấy tài khoản');
        error.statusCode = 409;
        error.result = {
            content: []
        };
        throw error;
    }
    account.blackList = false;
    await account.save();
};

export const createAccount = async (adminId: string, fullName: string, email: string, password: string, phone: string, position: string) => {
    const admin = await User.findById(adminId);
    if (!admin) {
        const error: Error & { statusCode?: number, result?: any } = new Error('UnAuthorized');
        error.statusCode = 401;
        error.result = null;
        throw error;
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const roleId = await Role.findOne({roleName: position, isActive: true});
    if (!roleId) {
        const error: Error & { statusCode?: number, result?: any } = new Error('Không tìm thấy role này');
        error.statusCode = 409;
        error.result = null;
        throw error;
    }
    const user = new User({
        fullName: fullName,
        email: email,
        password: hashedPassword,
        phone: phone,
        roleId: roleId,
        isActive: true,
        isVerifiedEmail: true,
        blackList: false
    })
    await user.save();
};