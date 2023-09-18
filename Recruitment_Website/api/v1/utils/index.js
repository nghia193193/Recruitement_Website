"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImage = exports.refreshKey = exports.secretKey = void 0;
const config_1 = require("../../../config");
exports.secretKey = 'nghiatrongrecruitementwebsitenam42023secretkey';
exports.refreshKey = 'nghiatrongrecruitementwebsitenam42023refreshkey';
async function uploadImage(filePath, publicId) {
    try {
        const result = await config_1.cloudConfig.uploader.upload(filePath, {
            public_id: publicId, // Tên công khai cho tệp ảnh trên Cloudinary
        });
        console.log('Upload thành công: ', result);
    }
    catch (error) {
        const err = new Error('Upload thất bại');
        throw err;
    }
}
exports.uploadImage = uploadImage;
