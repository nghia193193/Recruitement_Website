import * as jwt from 'jsonwebtoken';
import { UploadedFile } from 'express-fileupload';

export const secretKey = 'nghiatrongrecruitementwebsitenam42023secretkey';
export const refreshKey = 'nghiatrongrecruitementwebsitenam42023refreshkey';

export async function verifyToken(accessToken: string) {
    return new Promise((resolve, reject) => {
      jwt.verify(accessToken, secretKey, (err, decoded: any) => {
        if (err) {
            const error: Error & {statusCode?: number, result?: any} = new Error('Invalid or expired access token');
            error.statusCode = 401;
            throw error;
        } else {
            resolve(decoded);
        }
      });
    });
};

export const isPDF = function isPDF(file: UploadedFile): boolean {
  const allowedExtensions = ['.pdf']; 
  const fileExtension = (file.name || '').toLowerCase().split('.').pop();
  return allowedExtensions.includes(`.${fileExtension}`);
}