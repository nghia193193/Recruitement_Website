import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { User } from '../models/user';
import * as jwt from 'jsonwebtoken';
import { secretKey } from '../utils';
import {v2 as cloudinary} from 'cloudinary';