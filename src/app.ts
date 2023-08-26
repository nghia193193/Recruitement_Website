import express, { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import path from 'path';
import authRoutes from './routes/auth';

const app = express();

app.use(bodyParser.json());
// app.use('/images', express.static(path.join(__dirname, 'public/images')));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use(authRoutes);

app.use((error: any, req: Request, res: Response, next: NextFunction) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    const errorData = error.data;
    res.status(status).json({ message: message, errorData: errorData });
});

mongoose.connect('mongodb+srv://nghia193:Aa123456@cluster0.nizvwnm.mongodb.net/Recruiment_Website?retryWrites=true&w=majority')
    .then(result => {
        app.listen(8050);
    })
    .catch(err => console.log(err));