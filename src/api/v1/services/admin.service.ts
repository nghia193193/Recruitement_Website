import { Certificate } from "../models/certificate";
import { Education } from "../models/education";
import { Experience } from "../models/experience";
import { Project } from "../models/project";
import { Role } from "../models/role";
import { User } from "../models/user";

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
        .populate('roleId')
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)

    const returnListAccounts = listAccounts.map(account => {
        return {
            accountId: account._id.toString(),
            accountFullName: account.fullName,
            accountRole: account.get('roleId.roleName'),
            accountPhone: account.phone,
            accountEmail: account.email,
            createdDate: account.createdAt,
        }
    })
    return { accountLength, returnListAccounts }
};

export const getSingleAccount = async (adminId: string, accountId: string) => {
    const admin = await User.findById(adminId);
    if (!admin) {
        const error: Error & { statusCode?: number, result?: any } = new Error('UnAuthorized');
        error.statusCode = 401;
        error.result = {
            content: []
        };
        throw error;
    }
    const account = await User.findById(accountId).populate('roleId skills.skillId');
    if (!account) {
        const error: Error & { statusCode?: number, result?: any } = new Error('Không tìm thấy tài khoản');
        error.statusCode = 401;
        error.result = {
            content: []
        };
        throw error;
    }
    const educationList = await Education.find({ candidateId: accountId });
    const returnEducationList = educationList.map(e => {
        return {
            school: e.school,
            major: e.major,
            graduatedYead: e.graduatedYear
        }

    })
    const experienceList = await Experience.find({ candidateId: accountId });
    const returnExperienceList = experienceList.map(e => {
        return {
            companyName: e.companyName,
            position: e.position,
            dateFrom: e.dateFrom,
            dateTo: e.dateTo
        }
    })
    const certificateList = await Certificate.find({ candidateId: accountId });
    const returnCertificateList = certificateList.map(c => {
        return {
            name: c.name,
            receivedDate: c.receivedDate,
            url: c.url
        }
    })
    const projectList = await Project.find({ candidateId: accountId });
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
    }
    return {returnAccount};
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
        .populate('roleId')
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)

    const returnListAccounts = listAccounts.map(account => {
        return {
            accountId: account._id.toString(),
            accountFullName: account.fullName,
            accountRole: account.get('roleId.roleName'),
            accountPhone: account.phone,
            accountEmail: account.email,
            createdDate: account.createdAt,
        }
    })
    return { accountLength, returnListAccounts }
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
        .populate('roleId')
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)

    const returnListAccounts = listAccounts.map(account => {
        return {
            accountId: account._id.toString(),
            accountFullName: account.fullName,
            accountRole: account.get('roleId.roleName'),
            accountPhone: account.phone,
            accountEmail: account.email,
            createdDate: account.createdAt,
        }
    })
    return { accountLength, returnListAccounts }
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
        .populate('roleId')
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)

    const returnListAccounts = listAccounts.map(account => {
        return {
            accountId: account._id.toString(),
            accountFullName: account.fullName,
            accountRole: account.get('roleId.roleName'),
            accountPhone: account.phone,
            accountEmail: account.email,
            createdDate: account.createdAt,
        }
    })
    return { accountLength, returnListAccounts }
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
        .populate('roleId')
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)

    const returnListAccounts = listAccounts.map(account => {
        return {
            accountId: account._id.toString(),
            accountFullName: account.fullName,
            accountRole: account.get('roleId.roleName'),
            accountPhone: account.phone,
            accountEmail: account.email,
            createdDate: account.createdAt,
        }
    })
    return { accountLength, returnListAccounts }
};