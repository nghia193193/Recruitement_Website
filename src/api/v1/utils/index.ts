import * as jwt from 'jsonwebtoken';
import { UploadedFile } from 'express-fileupload';
import * as nodemailer from 'nodemailer';

export const secretKey = 'nghiatrongrecruitementwebsitenam42023secretkey';
export const refreshKey = 'nghiatrongrecruitementwebsitenam42023refreshkey';
export const ApplyStatus: string[] = ['PENDING', 'REVIEWING', 'INTERVIEWING', 'COMPLETED'];

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS
  }
});

export async function verifyToken(accessToken: string) {
    return new Promise((resolve, reject) => {
      jwt.verify(accessToken, secretKey, (err, decoded: any) => {
        if (err) {
            console.log(err)
            const error: Error & {statusCode?: number, result?: any} = new Error('Invalid or expired access token');
            error.statusCode = 401;
            throw error;
        } else {
            resolve(decoded);
        }
      });
    });
};

export async function verifyRefreshToken(refreshToken: string) {
  return new Promise((resolve, reject) => {
    jwt.verify(refreshToken, refreshKey, (err, decoded: any) => {
      if (err) {
          console.log(err);
          const error: Error & {statusCode?: number, result?: any} = new Error('Invalid or expired refresh token');
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
};

export function isValidTimeFormat(timeString: string) {
  const timePattern = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timePattern.test(timeString);
}

export function CheckRoleRecruiter() {

}