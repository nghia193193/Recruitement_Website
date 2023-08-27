import express, { Application, NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import path from 'path';
import authRoutes from './routes/auth';
import helmet from 'helmet';
import cors from 'cors'
console.log(process.env.MONGO_USER);
const MONGO_URI: string = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PW}@cluster0.nizvwnm.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`;

const app: Application = express();

app.use(cors());
app.use(helmet());
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

mongoose.connect(MONGO_URI)
    .then(result => {
        app.listen(8050);
    })
    .catch(err => console.log(err));