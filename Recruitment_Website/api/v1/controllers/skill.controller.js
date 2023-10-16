"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAllSkills = void 0;
const skill_1 = require("../models/skill");
const GetAllSkills = async (req, res, next) => {
    try {
        const skills = await skill_1.Skill.find();
        const listSkills = skills.map(skill => {
            return {
                skillId: skill._id,
                name: skill.name
            };
        });
        res.status(200).json({ success: true, message: 'Lấy list skills thành công', result: listSkills });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
    ;
};
exports.GetAllSkills = GetAllSkills;
