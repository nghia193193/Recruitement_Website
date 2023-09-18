import {cloudConfig} from '../../../config';

export const secretKey = 'nghiatrongrecruitementwebsitenam42023secretkey';
export const refreshKey = 'nghiatrongrecruitementwebsitenam42023refreshkey';

export async function uploadImage(filePath: string, publicId: string) {
    try {
        const result = await cloudConfig.uploader.upload(filePath, {
            public_id: publicId, // Tên công khai cho tệp ảnh trên Cloudinary
        });
        console.log('Upload thành công: ', result);
    } catch (error) {
        const err: Error & {statusCode?: number} = new Error('Upload thất bại');
        throw err;
    }
}