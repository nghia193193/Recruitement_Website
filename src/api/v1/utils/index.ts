import * as jwt from 'jsonwebtoken';
import { UploadedFile } from 'express-fileupload';
import createHttpError from 'http-errors';
import { client } from '../../../config/redis.config';

export const secretKey = process.env.JWT_SECRET_KEY as string;
export const refreshKey = process.env.JWT_REFRESH_KEY as string;
export const jobLocation = ['FTOWN1', 'FTOWN2', 'FTOWN3', 'REMOTE'];
export const jobPosition = ['FRONTEND', 'BACKEND', 'FULLSTACK', 'DEVOPS', 'TESTER', 'ANDROID'];
export const jobType = ['PART_TIME', 'FULL_TIME', 'REMOTE'];
export const skills = [
  'Java', 'Python', 'C#', 'C++', 'PHP', 'JavaScript', 'Node.js', 'React.js', 'TypeScript',
  'GraphQL', 'Next.js', 'Tailwind CSS', 'REST APIs', 'CSS', 'HTML', 'Back-End Development', 'Front-End Development',
  'AWS', 'CICD', 'DevOps', 'SQL', 'NoSQL', 'API Testing', 'Software Testing', 'Test Cases', 'Test Data', 'Test Planning',
  'Test Scripts', 'Communication', 'Consultation', 'Negotiation', 'Optimization', 'Problem Solving'
];
export const applyStatus = ['PENDING', 'REVIEWING', 'PASS', 'FAIL'];
export const questionType = ['Technical', 'SoftSkill', 'English'];

export const signAccessToken = async (userId: any) => {
  return new Promise((resole, reject) => {
    const payload = {
      userId
    }
    const options = {
      expiresIn: '1h'
    }
    jwt.sign(payload, secretKey, options, (err, token) => {
      if (err) reject(err);
      resole(token);
    });
  })
}

export const signRefreshToken = async (userId: any) => {
  return new Promise((resolve, reject) => {
    const payload = {
      userId
    }
    const options = {
      expiresIn: '1y'
    }
    jwt.sign(payload, refreshKey, options, async (err, token) => {
      if (err) return reject(err);
      try {
        const key = userId.toString() as string;
        const value = token as string;
        await client.set(key, value, { EX: 365 * 24 * 60 * 60 });
        resolve(token);
      } catch (error) {
        console.log(error)
        reject(error);
      }
    });
  })
}

export async function verifyAccessToken(accessToken: string) {
  return new Promise((resolve, reject) => {
    jwt.verify(accessToken, secretKey, (err, decoded: any) => {
      if (err) {
        // invalid error,...
        if (err.name === 'JsonWebTokenError') {
          return reject(createHttpError.Unauthorized());
        }
        // token expired error
        return reject(createHttpError.Unauthorized(err.message));
      } else {
        resolve(decoded);
      }
    });
  });
};

export async function verifyRefreshToken(refreshToken: string) {
  return new Promise((resolve, reject) => {
    jwt.verify(refreshToken, refreshKey, async (err, decoded: any) => {
      if (err) {
        // invalid error,...
        if (err.name === 'JsonWebTokenError') {
          return reject(createHttpError.Unauthorized());
        }
        // token expired error
        return reject(createHttpError.Unauthorized(err.message));
      }
      const storedRT = await client.get(decoded.userId);
      if (storedRT !== refreshToken) {
        return reject(createHttpError.Unauthorized());
      }
      resolve(decoded);
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

export function formatDateToJSDateObject(inputDate: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    timeZoneName: 'short',
  };
  const vietnameseDate: string = inputDate.toLocaleString('vi-VN', options);
  return vietnameseDate;
}

export function createICalEvent(startTime: Date, endTime: Date, attendees: string[]): string {
  const startISOString = startTime.toISOString();
  const endISOString = endTime.toISOString();
  const attendeesString = attendees.map(attendee => `ATTENDEE:${attendee}`).join('\r\n');
  const iCalString =
    `
      BEGIN:VCALENDAR
      VERSION:2.0
      BEGIN:VEVENT
      DTSTART:${startISOString}
      DTEND:${endISOString}
      ${attendeesString}
      END:VEVENT
      END:VCALENDAR
  `;

  return iCalString;
}

export function addFractionStrings(x1: string, x2: string) {
  const [numerator1, denominator1] = x1.split('/').map(Number);
  const [numerator2, denominator2] = x2.split('/').map(Number);

  const newNumerator = numerator1 + numerator2;
  const newDenominator = denominator1 + denominator2;

  return `${newNumerator}/${newDenominator}`;
}