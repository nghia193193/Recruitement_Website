import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';
import { isAuth } from '../middleware';
import { body, param, query } from 'express-validator';
import sanitizeHtml from 'sanitize-html';

const router = Router();

router.get('/users', isAuth, [
    query('page').trim()
        .custom((value: string) => {
            if (value) {
                const regex = /^[0-9]+$/;
                if (!regex.test(value)) {
                    throw new Error('page không hợp lệ');
                };
                const intValue = parseInt(value, 10);
                if (isNaN(intValue) || intValue <= 0) {
                    throw new Error('page phải là số nguyên lớn hơn 0');
                }
            }
            return true;
        }),
    query('limit').trim()
        .custom((value: string) => {
            if (value) {
                const regex = /^[0-9]+$/;
                if (!regex.test(value)) {
                    throw new Error('limit không hợp lệ');
                };
                const intValue = parseInt(value, 10);
                if (isNaN(intValue) || intValue <= 0) {
                    throw new Error('limit phải là số nguyên lớn hơn 0');
                }
            }
            return true;
        }),
    query('active').trim()
        .custom((value: string) => {
            if (value) {
                const validActive = ['true', 'false'];
                if (!validActive.includes(value)) {
                    throw new Error('active không hợp lệ');
                }
                return true;
            }
            return true;
        }),
    query('searchBy').trim()
        .custom((value: string) => {
            if (value) {
                const validSearchBy = ['name', 'email', 'phone'];
                if (!validSearchBy.includes(value)) {
                    throw new Error('searchBy không hợp lệ');
                }
                return true
            }
            return true;
        }),
    query('searchText').trim()
        .custom((value: string) => {
            if (value) {
                if (value) {
                    const regex = /^[\p{L} ]+$/u;
                    if (!regex.test(value)) {
                        throw new Error('Nội dung tìm kiếm không được chứa ký tự đặc biệt trừ dấu cách');
                    };
                    return true;
                }
                return true;
            }
            return true;
        })
], adminController.getAllAccounts);

router.get('/users/recruiter', isAuth, [
    query('page').trim()
        .custom((value: string) => {
            if (value) {
                const regex = /^[0-9]+$/;
                if (!regex.test(value)) {
                    throw new Error('page không hợp lệ');
                };
                const intValue = parseInt(value, 10);
                if (isNaN(intValue) || intValue <= 0) {
                    throw new Error('page phải là số nguyên lớn hơn 0');
                }
            }
            return true;
        }),
    query('limit').trim()
        .custom((value: string) => {
            if (value) {
                const regex = /^[0-9]+$/;
                if (!regex.test(value)) {
                    throw new Error('limit không hợp lệ');
                };
                const intValue = parseInt(value, 10);
                if (isNaN(intValue) || intValue <= 0) {
                    throw new Error('limit phải là số nguyên lớn hơn 0');
                }
            }
            return true;
        }),
    query('active').trim()
        .custom((value: string) => {
            if (value) {
                const validActive = ['true', 'false'];
                if (!validActive.includes(value)) {
                    throw new Error('active không hợp lệ');
                }
                return true;
            }
            return true;
        }),
    query('searchBy').trim()
        .custom((value: string) => {
            if (value) {
                const validSearchBy = ['name', 'email', 'phone'];
                if (!validSearchBy.includes(value)) {
                    throw new Error('searchBy không hợp lệ');
                }
                return true
            }
            return true;
        }),
    query('searchText').trim()
        .custom((value: string) => {
            if (value) {
                if (value) {
                    const regex = /^[\p{L} ]+$/u;
                    if (!regex.test(value)) {
                        throw new Error('Nội dung tìm kiếm không được chứa ký tự đặc biệt trừ dấu cách');
                    };
                    return true;
                }
                return true;
            }
            return true;
        })
], adminController.getAllRecruiterAccounts);

router.get('/users/interviewer', isAuth, [
    query('page').trim()
        .custom((value: string) => {
            if (value) {
                const regex = /^[0-9]+$/;
                if (!regex.test(value)) {
                    throw new Error('page không hợp lệ');
                };
                const intValue = parseInt(value, 10);
                if (isNaN(intValue) || intValue <= 0) {
                    throw new Error('page phải là số nguyên lớn hơn 0');
                }
            }
            return true;
        }),
    query('limit').trim()
        .custom((value: string) => {
            if (value) {
                const regex = /^[0-9]+$/;
                if (!regex.test(value)) {
                    throw new Error('limit không hợp lệ');
                };
                const intValue = parseInt(value, 10);
                if (isNaN(intValue) || intValue <= 0) {
                    throw new Error('limit phải là số nguyên lớn hơn 0');
                }
            }
            return true;
        }),
    query('active').trim()
        .custom((value: string) => {
            if (value) {
                const validActive = ['true', 'false'];
                if (!validActive.includes(value)) {
                    throw new Error('active không hợp lệ');
                }
                return true;
            }
            return true;
        }),
    query('searchBy').trim()
        .custom((value: string) => {
            if (value) {
                const validSearchBy = ['name', 'email', 'phone'];
                if (!validSearchBy.includes(value)) {
                    throw new Error('searchBy không hợp lệ');
                }
                return true
            }
            return true;
        }),
    query('searchText').trim()
        .custom((value: string) => {
            if (value) {
                if (value) {
                    const regex = /^[\p{L} ]+$/u;
                    if (!regex.test(value)) {
                        throw new Error('Nội dung tìm kiếm không được chứa ký tự đặc biệt trừ dấu cách');
                    };
                    return true;
                }
                return true;
            }
            return true;
        })
], adminController.getAllInterviewerAccounts);

router.get('/users/candidate', isAuth, [
    query('page').trim()
        .custom((value: string) => {
            if (value) {
                const regex = /^[0-9]+$/;
                if (!regex.test(value)) {
                    throw new Error('page không hợp lệ');
                };
                const intValue = parseInt(value, 10);
                if (isNaN(intValue) || intValue <= 0) {
                    throw new Error('page phải là số nguyên lớn hơn 0');
                }
            }
            return true;
        }),
    query('limit').trim()
        .custom((value: string) => {
            if (value) {
                const regex = /^[0-9]+$/;
                if (!regex.test(value)) {
                    throw new Error('limit không hợp lệ');
                };
                const intValue = parseInt(value, 10);
                if (isNaN(intValue) || intValue <= 0) {
                    throw new Error('limit phải là số nguyên lớn hơn 0');
                }
            }
            return true;
        }),
    query('active').trim()
        .custom((value: string) => {
            if (value) {
                const validActive = ['true', 'false'];
                if (!validActive.includes(value)) {
                    throw new Error('active không hợp lệ');
                }
                return true;
            }
            return true;
        }),
    query('searchBy').trim()
        .custom((value: string) => {
            if (value) {
                const validSearchBy = ['name', 'email', 'phone'];
                if (!validSearchBy.includes(value)) {
                    throw new Error('searchBy không hợp lệ');
                }
                return true
            }
            return true;
        }),
    query('searchText').trim()
        .custom((value: string) => {
            if (value) {
                if (value) {
                    const regex = /^[\p{L} ]+$/u;
                    if (!regex.test(value)) {
                        throw new Error('Nội dung tìm kiếm không được chứa ký tự đặc biệt trừ dấu cách');
                    };
                    return true;
                }
                return true;
            }
            return true;
        })
], adminController.getAllCandidateAccounts);

router.get('/users/blacklist', isAuth, [
    query('page').trim()
        .custom((value: string) => {
            if (value) {
                const regex = /^[0-9]+$/;
                if (!regex.test(value)) {
                    throw new Error('page không hợp lệ');
                };
                const intValue = parseInt(value, 10);
                if (isNaN(intValue) || intValue <= 0) {
                    throw new Error('page phải là số nguyên lớn hơn 0');
                }
            }
            return true;
        }),
    query('limit').trim()
        .custom((value: string) => {
            if (value) {
                const regex = /^[0-9]+$/;
                if (!regex.test(value)) {
                    throw new Error('limit không hợp lệ');
                };
                const intValue = parseInt(value, 10);
                if (isNaN(intValue) || intValue <= 0) {
                    throw new Error('limit phải là số nguyên lớn hơn 0');
                }
            }
            return true;
        }),
    query('active').trim()
        .custom((value: string) => {
            if (value) {
                const validActive = ['true', 'false'];
                if (!validActive.includes(value)) {
                    throw new Error('active không hợp lệ');
                }
                return true;
            }
            return true;
        }),
    query('searchBy').trim()
        .custom((value: string) => {
            if (value) {
                const validSearchBy = ['name', 'email', 'phone'];
                if (!validSearchBy.includes(value)) {
                    throw new Error('searchBy không hợp lệ');
                }
                return true
            }
            return true;
        }),
    query('searchText').trim()
        .custom((value: string) => {
            if (value) {
                if (value) {
                    const regex = /^[\p{L} ]+$/u;
                    if (!regex.test(value)) {
                        throw new Error('Nội dung tìm kiếm không được chứa ký tự đặc biệt trừ dấu cách');
                    };
                    return true;
                }
                return true;
            }
            return true;
        })
], adminController.getAllBlackListAccounts);

router.post('/users/blacklist/:userId', isAuth, [
    param('userId').trim().isMongoId().withMessage('userId không hợp lệ')
], adminController.addBlackList);

router.delete('/candidate/:candidateId', isAuth, [
    param('candidateId').trim().isMongoId().withMessage('candidateId không hợp lệ')
], adminController.removeBlackList);

router.post('/create_account', isAuth, [
    body('fullName').trim()
        .isLength({ min: 5, max: 50 }).withMessage('Độ dài của họ và tên trong khoảng 5-50 ký tự')
        .custom((value: string) => {
            const regex = /^[\p{L} ]+$/u; // Cho phép chữ, số và dấu cách
            if (!regex.test(value)) {
                throw new Error('Tên không được chứa ký tự đặc biệt trừ dấu cách');
            };
            return true;
        }),
    body('email').trim()
        .isEmail().withMessage('Email không hợp lệ')
        .normalizeEmail(),
    body('phone').trim()
        .custom((value: string) => {
            // Định dạng số điện thoại của Việt Nam
            const phonePattern = /^(0[2-9]|1[0-9]|2[0-8]|3[2-9]|5[6|8|9]|7[0|6-9]|8[1-5])[0-9]{8}$/;
            if (!phonePattern.test(value)) {
                throw new Error('Số điện thoại không hợp lệ');
            }
            return true;
        }),
    body('password').trim()
        .isLength({ min: 8, max: 32 }).withMessage('Mật khẩu có độ dài từ 8-32 ký tự')
        .customSanitizer((value) => {
            const sanitizedValue = sanitizeHtml(value);
            return sanitizedValue;
        }),
    body('confirmPassword').trim()
        .notEmpty().withMessage('Vui lòng xác nhận mật khẩu'),
    body('position').trim()
        .custom((value: string) => {
            const validPosition = ['INTERVIEWER', 'RECRUITER'];
            if (!validPosition.includes(value)) {
                throw new Error('Chỉ cho phép vị trí interviewer/recruiter');
            }
            return true;
        })
], adminController.createAccount);

router.get('/jobs', isAuth, [
    query('page').trim()
        .custom((value: string) => {
            if (value) {
                const regex = /^[0-9]+$/;
                if (!regex.test(value)) {
                    throw new Error('page không hợp lệ');
                };
                const intValue = parseInt(value, 10);
                if (isNaN(intValue) || intValue <= 0) {
                    throw new Error('page phải là số nguyên lớn hơn 0');
                }
            }
            return true;
        }),
    query('limit').trim()
        .custom((value: string) => {
            if (value) {
                const regex = /^[0-9]+$/;
                if (!regex.test(value)) {
                    throw new Error('limit không hợp lệ');
                };
                const intValue = parseInt(value, 10);
                if (isNaN(intValue) || intValue <= 0) {
                    throw new Error('limit phải là số nguyên lớn hơn 0');
                }
            }
            return true;
        }),
    query('recruiterName').trim()
        .custom((value: string) => {
            if (value) {
                const regex = /^[\p{L} ]+$/u;
                if (!regex.test(value)) {
                    throw new Error('Tên không được chứa ký tự đặc biệt trừ dấu cách');
                };
                return true;
            }
            return true
        }),
    query('jobName').trim()
        .custom((value: string) => {
            if (value) {
                const regex = /^[\p{L} #+]+$/u;
                if (!regex.test(value)) {
                    throw new Error('Tên không được chứa ký tự đặc biệt trừ dấu cách, #+');
                };
                return true;
            }
            return true
        }),
], adminController.getAllJobs);

router.get('/events', isAuth, [
    query('page').trim()
        .custom((value: string) => {
            if (value) {
                const regex = /^[0-9]+$/;
                if (!regex.test(value)) {
                    throw new Error('page không hợp lệ');
                };
                const intValue = parseInt(value, 10);
                if (isNaN(intValue) || intValue <= 0) {
                    throw new Error('page phải là số nguyên lớn hơn 0');
                }
            }
            return true;
        }),
    query('limit').trim()
        .custom((value: string) => {
            if (value) {
                const regex = /^[0-9]+$/;
                if (!regex.test(value)) {
                    throw new Error('limit không hợp lệ');
                };
                const intValue = parseInt(value, 10);
                if (isNaN(intValue) || intValue <= 0) {
                    throw new Error('limit phải là số nguyên lớn hơn 0');
                }
            }
            return true;
        }),
    query('recruiterName').trim()
        .custom((value: string) => {
            if (value) {
                const regex = /^[\p{L} ]+$/u;
                if (!regex.test(value)) {
                    throw new Error('Tên không được chứa ký tự đặc biệt trừ dấu cách');
                };
                return true;
            }
            return true
        }),
    query('eventName').trim()
        .custom((value: string) => {
            if (value) {
                const regex = /^[\p{L} #+]+$/u;
                if (!regex.test(value)) {
                    throw new Error('Tên không được chứa ký tự đặc biệt trừ dấu cách, #+');
                };
                return true;
            }
            return true
        }),
], adminController.getAllEvents);

router.get('/statistics', isAuth, adminController.adminStatistics);

export default router