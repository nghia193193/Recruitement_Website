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
    console.log('query: ',query);
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
        .skip((page-1)*limit)
        .limit(limit)
    
    const returnListAccounts = listAccounts.map(account => {
        return {
            accountFullName: account.fullName,
            accountRole: account.get('roleId.roleName'),
            accountPhone: account.phone,
            accountEmail: account.email,
            createdDate: account.createdAt,
        }
    })
    return {accountLength, returnListAccounts}
};