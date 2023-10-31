import * as jwt from 'jsonwebtoken';
import { UploadedFile } from 'express-fileupload';
import * as nodemailer from 'nodemailer';

export const secretKey = 'nghiatrongrecruitementwebsitenam42023secretkey';
export const refreshKey = 'nghiatrongrecruitementwebsitenam42023refreshkey';

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

export function isValidISO8601Date(dateString: string) {
  const iso8601Pattern = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\.(\d{3})Z$/;
  return iso8601Pattern.test(dateString);
};