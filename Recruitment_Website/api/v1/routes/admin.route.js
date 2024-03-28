"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("../controllers/admin.controller");
const middleware_1 = require("../middleware");
const express_validator_1 = require("express-validator");
const sanitize_html_1 = __importDefault(require("sanitize-html"));
const router = (0, express_1.Router)();
router.get('/users', middleware_1.isAuth, [
    (0, express_validator_1.query)('page').trim()
        .custom((value) => {
        if (value) {
            const regex = /^[0-9]+$/;
            if (!regex.test(value)) {
                throw new Error('page không hợp lệ');
            }
            ;
            const intValue = parseInt(value, 10);
            if (isNaN(intValue) || intValue <= 0) {
                throw new Error('page phải là số nguyên lớn hơn 0');
            }
        }
        return true;
    }),
    (0, express_validator_1.query)('limit').trim()
        .custom((value) => {
        if (value) {
            const regex = /^[0-9]+$/;
            if (!regex.test(value)) {
                throw new Error('limit không hợp lệ');
            }
            ;
            const intValue = parseInt(value, 10);
            if (isNaN(intValue) || intValue <= 0) {
                throw new Error('limit phải là số nguyên lớn hơn 0');
            }
        }
        return true;
    }),
    (0, express_validator_1.query)('active').trim()
        .custom((value) => {
        if (value) {
            const validActive = ['true', 'false'];
            if (!validActive.includes(value)) {
                throw new Error('active không hợp lệ');
            }
            return true;
        }
        return true;
    }),
    (0, express_validator_1.query)('searchBy').trim()
        .custom((value) => {
        if (value) {
            const validSearchBy = ['name', 'email', 'phone'];
            if (!validSearchBy.includes(value)) {
                throw new Error('searchBy không hợp lệ');
            }
            return true;
        }
        return true;
    }),
    (0, express_validator_1.query)('searchText').trim()
        .custom((value) => {
        if (value) {
            if (value) {
                const regex = /^[\p{L} ]+$/u;
                if (!regex.test(value)) {
                    throw new Error('Nội dung tìm kiếm không được chứa ký tự đặc biệt trừ dấu cách');
                }
                ;
                return true;
            }
            return true;
        }
        return true;
    })
], admin_controller_1.adminController.getAllAccounts);
router.get('/users/recruiter', middleware_1.isAuth, [
    (0, express_validator_1.query)('page').trim()
        .custom((value) => {
        if (value) {
            const regex = /^[0-9]+$/;
            if (!regex.test(value)) {
                throw new Error('page không hợp lệ');
            }
            ;
            const intValue = parseInt(value, 10);
            if (isNaN(intValue) || intValue <= 0) {
                throw new Error('page phải là số nguyên lớn hơn 0');
            }
        }
        return true;
    }),
    (0, express_validator_1.query)('limit').trim()
        .custom((value) => {
        if (value) {
            const regex = /^[0-9]+$/;
            if (!regex.test(value)) {
                throw new Error('limit không hợp lệ');
            }
            ;
            const intValue = parseInt(value, 10);
            if (isNaN(intValue) || intValue <= 0) {
                throw new Error('limit phải là số nguyên lớn hơn 0');
            }
        }
        return true;
    }),
    (0, express_validator_1.query)('active').trim()
        .custom((value) => {
        if (value) {
            const validActive = ['true', 'false'];
            if (!validActive.includes(value)) {
                throw new Error('active không hợp lệ');
            }
            return true;
        }
        return true;
    }),
    (0, express_validator_1.query)('searchBy').trim()
        .custom((value) => {
        if (value) {
            const validSearchBy = ['name', 'email', 'phone'];
            if (!validSearchBy.includes(value)) {
                throw new Error('searchBy không hợp lệ');
            }
            return true;
        }
        return true;
    }),
    (0, express_validator_1.query)('searchText').trim()
        .custom((value) => {
        if (value) {
            if (value) {
                const regex = /^[\p{L} ]+$/u;
                if (!regex.test(value)) {
                    throw new Error('Nội dung tìm kiếm không được chứa ký tự đặc biệt trừ dấu cách');
                }
                ;
                return true;
            }
            return true;
        }
        return true;
    })
], admin_controller_1.adminController.getAllRecruiterAccounts);
router.get('/users/interviewer', middleware_1.isAuth, [
    (0, express_validator_1.query)('page').trim()
        .custom((value) => {
        if (value) {
            const regex = /^[0-9]+$/;
            if (!regex.test(value)) {
                throw new Error('page không hợp lệ');
            }
            ;
            const intValue = parseInt(value, 10);
            if (isNaN(intValue) || intValue <= 0) {
                throw new Error('page phải là số nguyên lớn hơn 0');
            }
        }
        return true;
    }),
    (0, express_validator_1.query)('limit').trim()
        .custom((value) => {
        if (value) {
            const regex = /^[0-9]+$/;
            if (!regex.test(value)) {
                throw new Error('limit không hợp lệ');
            }
            ;
            const intValue = parseInt(value, 10);
            if (isNaN(intValue) || intValue <= 0) {
                throw new Error('limit phải là số nguyên lớn hơn 0');
            }
        }
        return true;
    }),
    (0, express_validator_1.query)('active').trim()
        .custom((value) => {
        if (value) {
            const validActive = ['true', 'false'];
            if (!validActive.includes(value)) {
                throw new Error('active không hợp lệ');
            }
            return true;
        }
        return true;
    }),
    (0, express_validator_1.query)('searchBy').trim()
        .custom((value) => {
        if (value) {
            const validSearchBy = ['name', 'email', 'phone'];
            if (!validSearchBy.includes(value)) {
                throw new Error('searchBy không hợp lệ');
            }
            return true;
        }
        return true;
    }),
    (0, express_validator_1.query)('searchText').trim()
        .custom((value) => {
        if (value) {
            if (value) {
                const regex = /^[\p{L} ]+$/u;
                if (!regex.test(value)) {
                    throw new Error('Nội dung tìm kiếm không được chứa ký tự đặc biệt trừ dấu cách');
                }
                ;
                return true;
            }
            return true;
        }
        return true;
    })
], admin_controller_1.adminController.getAllInterviewerAccounts);
router.get('/users/candidate', middleware_1.isAuth, [
    (0, express_validator_1.query)('page').trim()
        .custom((value) => {
        if (value) {
            const regex = /^[0-9]+$/;
            if (!regex.test(value)) {
                throw new Error('page không hợp lệ');
            }
            ;
            const intValue = parseInt(value, 10);
            if (isNaN(intValue) || intValue <= 0) {
                throw new Error('page phải là số nguyên lớn hơn 0');
            }
        }
        return true;
    }),
    (0, express_validator_1.query)('limit').trim()
        .custom((value) => {
        if (value) {
            const regex = /^[0-9]+$/;
            if (!regex.test(value)) {
                throw new Error('limit không hợp lệ');
            }
            ;
            const intValue = parseInt(value, 10);
            if (isNaN(intValue) || intValue <= 0) {
                throw new Error('limit phải là số nguyên lớn hơn 0');
            }
        }
        return true;
    }),
    (0, express_validator_1.query)('active').trim()
        .custom((value) => {
        if (value) {
            const validActive = ['true', 'false'];
            if (!validActive.includes(value)) {
                throw new Error('active không hợp lệ');
            }
            return true;
        }
        return true;
    }),
    (0, express_validator_1.query)('searchBy').trim()
        .custom((value) => {
        if (value) {
            const validSearchBy = ['name', 'email', 'phone'];
            if (!validSearchBy.includes(value)) {
                throw new Error('searchBy không hợp lệ');
            }
            return true;
        }
        return true;
    }),
    (0, express_validator_1.query)('searchText').trim()
        .custom((value) => {
        if (value) {
            if (value) {
                const regex = /^[\p{L} ]+$/u;
                if (!regex.test(value)) {
                    throw new Error('Nội dung tìm kiếm không được chứa ký tự đặc biệt trừ dấu cách');
                }
                ;
                return true;
            }
            return true;
        }
        return true;
    })
], admin_controller_1.adminController.getAllCandidateAccounts);
router.get('/users/blacklist', middleware_1.isAuth, [
    (0, express_validator_1.query)('page').trim()
        .custom((value) => {
        if (value) {
            const regex = /^[0-9]+$/;
            if (!regex.test(value)) {
                throw new Error('page không hợp lệ');
            }
            ;
            const intValue = parseInt(value, 10);
            if (isNaN(intValue) || intValue <= 0) {
                throw new Error('page phải là số nguyên lớn hơn 0');
            }
        }
        return true;
    }),
    (0, express_validator_1.query)('limit').trim()
        .custom((value) => {
        if (value) {
            const regex = /^[0-9]+$/;
            if (!regex.test(value)) {
                throw new Error('limit không hợp lệ');
            }
            ;
            const intValue = parseInt(value, 10);
            if (isNaN(intValue) || intValue <= 0) {
                throw new Error('limit phải là số nguyên lớn hơn 0');
            }
        }
        return true;
    }),
    (0, express_validator_1.query)('active').trim()
        .custom((value) => {
        if (value) {
            const validActive = ['true', 'false'];
            if (!validActive.includes(value)) {
                throw new Error('active không hợp lệ');
            }
            return true;
        }
        return true;
    }),
    (0, express_validator_1.query)('searchBy').trim()
        .custom((value) => {
        if (value) {
            const validSearchBy = ['name', 'email', 'phone'];
            if (!validSearchBy.includes(value)) {
                throw new Error('searchBy không hợp lệ');
            }
            return true;
        }
        return true;
    }),
    (0, express_validator_1.query)('searchText').trim()
        .custom((value) => {
        if (value) {
            if (value) {
                const regex = /^[\p{L} ]+$/u;
                if (!regex.test(value)) {
                    throw new Error('Nội dung tìm kiếm không được chứa ký tự đặc biệt trừ dấu cách');
                }
                ;
                return true;
            }
            return true;
        }
        return true;
    })
], admin_controller_1.adminController.getAllBlackListAccounts);
router.post('/users/blacklist/:userId', middleware_1.isAuth, [
    (0, express_validator_1.param)('userId').trim().isMongoId().withMessage('userId không hợp lệ')
], admin_controller_1.adminController.addBlackList);
router.delete('/candidate/:candidateId', middleware_1.isAuth, [
    (0, express_validator_1.param)('candidateId').trim().isMongoId().withMessage('candidateId không hợp lệ')
], admin_controller_1.adminController.removeBlackList);
router.post('/create_account', middleware_1.isAuth, [
    (0, express_validator_1.body)('fullName').trim()
        .isLength({ min: 5, max: 50 }).withMessage('Độ dài của họ và tên trong khoảng 5-50 ký tự')
        .custom((value) => {
        const regex = /^[\p{L} ]+$/u; // Cho phép chữ, số và dấu cách
        if (!regex.test(value)) {
            throw new Error('Tên không được chứa ký tự đặc biệt trừ dấu cách');
        }
        ;
        return true;
    }),
    (0, express_validator_1.body)('email').trim()
        .isEmail().withMessage('Email không hợp lệ'),
    (0, express_validator_1.body)('phone').trim()
        .custom((value) => {
        // Định dạng số điện thoại của Việt Nam
        const phonePattern = /^(0[2-9]|1[0-9]|2[0-8]|3[2-9]|5[6|8|9]|7[0|6-9]|8[1-5])[0-9]{8}$/;
        if (!phonePattern.test(value)) {
            throw new Error('Số điện thoại không hợp lệ');
        }
        return true;
    }),
    (0, express_validator_1.body)('password').trim()
        .isLength({ min: 8, max: 32 }).withMessage('Mật khẩu có độ dài từ 8-32 ký tự')
        .customSanitizer((value) => {
        const sanitizedValue = (0, sanitize_html_1.default)(value);
        return sanitizedValue;
    }),
    (0, express_validator_1.body)('confirmPassword').trim()
        .notEmpty().withMessage('Vui lòng xác nhận mật khẩu'),
    (0, express_validator_1.body)('position').trim()
        .custom((value) => {
        const validPosition = ['INTERVIEWER', 'RECRUITER'];
        if (!validPosition.includes(value)) {
            throw new Error('Chỉ cho phép vị trí interviewer/recruiter');
        }
        return true;
    })
], admin_controller_1.adminController.createAccount);
router.get('/jobs', middleware_1.isAuth, [
    (0, express_validator_1.query)('page').trim()
        .custom((value) => {
        if (value) {
            const regex = /^[0-9]+$/;
            if (!regex.test(value)) {
                throw new Error('page không hợp lệ');
            }
            ;
            const intValue = parseInt(value, 10);
            if (isNaN(intValue) || intValue <= 0) {
                throw new Error('page phải là số nguyên lớn hơn 0');
            }
        }
        return true;
    }),
    (0, express_validator_1.query)('limit').trim()
        .custom((value) => {
        if (value) {
            const regex = /^[0-9]+$/;
            if (!regex.test(value)) {
                throw new Error('limit không hợp lệ');
            }
            ;
            const intValue = parseInt(value, 10);
            if (isNaN(intValue) || intValue <= 0) {
                throw new Error('limit phải là số nguyên lớn hơn 0');
            }
        }
        return true;
    }),
    (0, express_validator_1.query)('recruiterName').trim()
        .custom((value) => {
        if (value) {
            const regex = /^[\p{L} ]+$/u;
            if (!regex.test(value)) {
                throw new Error('Tên không được chứa ký tự đặc biệt trừ dấu cách');
            }
            ;
            return true;
        }
        return true;
    }),
    (0, express_validator_1.query)('jobName').trim()
        .custom((value) => {
        if (value) {
            const regex = /^[\p{L} #+]+$/u;
            if (!regex.test(value)) {
                throw new Error('Tên không được chứa ký tự đặc biệt trừ dấu cách, #+');
            }
            ;
            return true;
        }
        return true;
    }),
], admin_controller_1.adminController.getAllJobs);
router.get('/events', middleware_1.isAuth, [
    (0, express_validator_1.query)('page').trim()
        .custom((value) => {
        if (value) {
            const regex = /^[0-9]+$/;
            if (!regex.test(value)) {
                throw new Error('page không hợp lệ');
            }
            ;
            const intValue = parseInt(value, 10);
            if (isNaN(intValue) || intValue <= 0) {
                throw new Error('page phải là số nguyên lớn hơn 0');
            }
        }
        return true;
    }),
    (0, express_validator_1.query)('limit').trim()
        .custom((value) => {
        if (value) {
            const regex = /^[0-9]+$/;
            if (!regex.test(value)) {
                throw new Error('limit không hợp lệ');
            }
            ;
            const intValue = parseInt(value, 10);
            if (isNaN(intValue) || intValue <= 0) {
                throw new Error('limit phải là số nguyên lớn hơn 0');
            }
        }
        return true;
    }),
    (0, express_validator_1.query)('recruiterName').trim()
        .custom((value) => {
        if (value) {
            const regex = /^[\p{L} ]+$/u;
            if (!regex.test(value)) {
                throw new Error('Tên không được chứa ký tự đặc biệt trừ dấu cách');
            }
            ;
            return true;
        }
        return true;
    }),
    (0, express_validator_1.query)('eventName').trim()
        .custom((value) => {
        if (value) {
            const regex = /^[\p{L} #+]+$/u;
            if (!regex.test(value)) {
                throw new Error('Tên không được chứa ký tự đặc biệt trừ dấu cách, #+');
            }
            ;
            return true;
        }
        return true;
    }),
], admin_controller_1.adminController.getAllEvents);
router.get('/statistics', middleware_1.isAuth, admin_controller_1.adminController.adminStatistics);
exports.default = router;
