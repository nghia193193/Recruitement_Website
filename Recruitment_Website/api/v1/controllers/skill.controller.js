"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAllSkills = void 0;
const utils_1 = require("../utils");
const GetAllSkills = async (req, res, next) => {
    try {
        res.status(200).json({ success: true, message: 'Lấy list skills thành công', result: utils_1.skills });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        next(err);
    }
    ;
};
exports.GetAllSkills = GetAllSkills;
