import { Certificate } from "../models/certificate";
import { Education } from "../models/education";
import { Event } from "../models/event";
import { Experience } from "../models/experience";
import { Job } from "../models/job";
import { JobApply } from "../models/jobApply";
import { Project } from "../models/project";
import { Role } from "../models/role";
import { User } from "../models/user";
import * as bcrypt from 'bcryptjs';

export const adminService = {
    getAllAccounts: async (adminId: string, searchText: any, searchBy: any, active: any, page: number, limit: number) => {
        const admin = await User.findById(adminId).populate('roleId');
        if (admin?.get('roleId.roleName') !== 'ADMIN') {
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
            const error: Error & { statusCode?: number, success?: any, result?: any } = new Error('Chưa có tài khoản nào');
            error.statusCode = 200;
            error.success = true;
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
                            information: {
                                education: returnEducationList,
                                experience: returnExperienceList,
                                certificate: returnCertificateList,
                                project: returnProjectList,
                                skills: account.skills
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
    },
    getAllRecruiterAccounts: async (adminId: string, searchText: any, searchBy: any, active: any, page: number, limit: number) => {
        const admin = await User.findById(adminId).populate('roleId');
        if (admin?.get('roleId.roleName') !== 'ADMIN') {
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
            const error: Error & { statusCode?: number, success?: any, result?: any } = new Error('Chưa có tài khoản nào');
            error.statusCode = 200;
            error.success = true;
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
                            information: {
                                education: returnEducationList,
                                experience: returnExperienceList,
                                certificate: returnCertificateList,
                                project: returnProjectList,
                                skills: account.skills
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
    },
    getAllInterviewerAccounts: async (adminId: string, searchText: any, searchBy: any, active: any, page: number, limit: number) => {
        const admin = await User.findById(adminId).populate('roleId');
        if (admin?.get('roleId.roleName') !== 'ADMIN') {
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
            const error: Error & { statusCode?: number, success?: any, result?: any } = new Error('Chưa có tài khoản nào');
            error.statusCode = 200;
            error.success = true;
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
                            information: {
                                education: returnEducationList,
                                experience: returnExperienceList,
                                certificate: returnCertificateList,
                                project: returnProjectList,
                                skills: account.skills
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
    },
    getAllCandidateAccounts: async (adminId: string, searchText: any, searchBy: any, active: any, page: number, limit: number) => {
        const admin = await User.findById(adminId).populate('roleId');
        if (admin?.get('roleId.roleName') !== 'ADMIN') {
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
            const error: Error & { statusCode?: number, success?: any, result?: any } = new Error('Chưa có tài khoản nào');
            error.statusCode = 200;
            error.success = true;
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
                            information: {
                                education: returnEducationList,
                                experience: returnExperienceList,
                                certificate: returnCertificateList,
                                project: returnProjectList,
                                skills: account.skills
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
    },
    getAllBlackListAccounts: async (adminId: string, searchText: any, searchBy: any, active: any, page: number, limit: number) => {
        const admin = await User.findById(adminId).populate('roleId');
        if (admin?.get('roleId.roleName') !== 'ADMIN') {
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
            const error: Error & { statusCode?: number, success?: any, result?: any } = new Error('Chưa có tài khoản nào');
            error.statusCode = 200;
            error.success = true;
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
                            information: {
                                education: returnEducationList,
                                experience: returnExperienceList,
                                certificate: returnCertificateList,
                                project: returnProjectList,
                                skills: account.skills
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
    },
    addBlackList: async (adminId: string, userId: string) => {
        const admin = await User.findById(adminId).populate('roleId');
        if (admin?.get('roleId.roleName') !== 'ADMIN') {
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
    },
    removeBlackList: async (adminId: string, candidateId: string) => {
        const admin = await User.findById(adminId).populate('roleId');
        if (admin?.get('roleId.roleName') !== 'ADMIN') {
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
    },
    createAccount: async (adminId: string, fullName: string, email: string, password: string, phone: string, position: string) => {
        const admin = await User.findById(adminId).populate('roleId');
        if (admin?.get('roleId.roleName') !== 'ADMIN') {
            const error: Error & { statusCode?: number, result?: any } = new Error('UnAuthorized');
            error.statusCode = 401;
            error.result = null;
            throw error;
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        const roleId = await Role.findOne({ roleName: position, isActive: true });
        if (!roleId) {
            const error: Error & { statusCode?: number, result?: any } = new Error('Không tìm thấy role này');
            error.statusCode = 409;
            error.result = null;
            throw error;
        }
        const emailUser = await User.findOne({ email: email });
        if (emailUser) {
            const error: Error & { statusCode?: number, result?: any } = new Error('Email đã tồn tại');
            error.statusCode = 409;
            error.result = null;
            throw error;
        }
        const phoneUser = await User.findOne({ phone: phone });
        if (phoneUser) {
            const error: Error & { statusCode?: number, result?: any } = new Error('Số điện thoại đã tồn tại');
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
    },
    getAllJobs: async (adminId: string, recruiterName: any, jobName: any, page: number, limit: number) => {
        const admin = await User.findById(adminId).populate('roleId');
        if (admin?.get('roleId.roleName') !== 'ADMIN') {
            const error: Error & { statusCode?: number, result?: any } = new Error('UnAuthorized');
            error.statusCode = 401;
            error.result = null;
            throw error;
        }
        const query: any = {};
        if (recruiterName) {
            const roleId = await Role.findOne({ roleName: "RECRUITER" });
            const authorId = await User.findOne({ fullName: recruiterName, roleId: roleId?._id.toString() });
            if (!authorId) {
                const error: Error & { statusCode?: number, result?: any } = new Error('Không tìm thấy recruiter');
                error.statusCode = 409;
                error.result = {
                    content: []
                };
                throw error;
            }
            query['authorId'] = authorId._id.toString();
        }
        if (jobName) {
            query['name'] = new RegExp(jobName, 'i');
        }
        const jobLength = await Job.find(query).countDocuments();
        if (jobLength === 0) {
            const error: Error & { statusCode?: any, success?: any, result?: any } = new Error('Không tìm thấy job');
            error.statusCode = 200;
            error.success = true;
            error.result = {
                content: []
            };
            throw error;
        };
        const jobs = await Job.find(query).populate('authorId')
            .sort({ updatedAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);
    
        const returnListJobs = async () => {
            const mappedJobs = await Promise.all(
                jobs.map(async (job) => {
                    try {
                        const process = await JobApply.find({ jobAppliedId: job._id.toString(), status: "PASS" }).countDocuments();
                        return {
                            jobId: job._id.toString(),
                            jobName: job.name,
                            quantity: job.quantity,
                            benefit: job.benefit,
                            salaryRange: job.salaryRange,
                            requirement: job.requirement,
                            description: job.description,
                            createdAt: job.createdAt,
                            deadline: job.deadline,
                            position: job.position,
                            location: job.location,
                            jobType: job.type,
                            author: job.get('authorId.fullName'),
                            process: process,
                            skills: job.skills,
                        };
                    } catch (error) {
                        console.error(error);
                        return null;
                    }
                })
            );
            return mappedJobs.filter(job => job !== null);
        }
        const listJobs = await returnListJobs().then(mappedJobs => {
            return mappedJobs;
        })
        return { jobLength, listJobs };
    },
    getAllEvents: async (adminId: string, recruiterName: any, eventName: any, page: number, limit: number) => {
        const admin = await User.findById(adminId).populate('roleId');
        if (admin?.get('roleId.roleName') !== 'ADMIN') {
            const error: Error & { statusCode?: number, result?: any } = new Error('UnAuthorized');
            error.statusCode = 401;
            error.result = null;
            throw error;
        }
        const query: any = {};
        if (recruiterName) {
            const roleId = await Role.findOne({ roleName: "RECRUITER" });
            const authorId = await User.findOne({ fullName: recruiterName, roleId: roleId?._id.toString() });
            if (!authorId) {
                const error: Error & { statusCode?: number, result?: any } = new Error('Không tìm thấy recruiter');
                error.statusCode = 409;
                error.result = {
                    content: []
                };
                throw error;
            }
            query['authorId'] = authorId._id.toString();
        }
        if (eventName) {
            query['name'] = new RegExp(eventName, 'i');
        }
        const eventLength = await Event.find(query).countDocuments();
        if (eventLength === 0) {
            const error: Error & { statusCode?: any, success?: any, result?: any } = new Error('Không tìm thấy sự kiện nào');
            error.statusCode = 200;
            error.success = true;
            error.result = {
                content: []
            };
            throw error;
        };
        const events = await Event.find(query).populate('authorId')
            .sort({ updatedAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);
        const listEvents = events.map(e => {
            const { _id, authorId, ...rest } = e;
            delete (rest as any)._doc._id;
            delete (rest as any)._doc.authorId;
            return {
                eventId: _id.toString(),
                author: (authorId as any).fullName,
                ...(rest as any)._doc
            }
        });
        return { eventLength, listEvents };
    },
    adminStatistics: async (adminId: string) => {
        const admin = await User.findById(adminId).populate('roleId');
        if (admin?.get('roleId.roleName') !== 'ADMIN') {
            const error: Error & { statusCode?: number, result?: any } = new Error('UnAuthorized');
            error.statusCode = 401;
            error.result = null;
            throw error;
        }
        const jobNumber = await Job.find().countDocuments();
        const eventNumber = await Event.find().countDocuments();
        const blackListNumber = await User.find({ blackList: true }).countDocuments();
        const candidatePassNumber = await JobApply.find({ status: 'PASS' }).countDocuments();
        return { jobNumber, eventNumber, blackListNumber, candidatePassNumber };
    },
}