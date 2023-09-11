"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const body_parser_1 = __importDefault(require("body-parser"));
// import authRoutes from './routes/auth';
// import jobRoutes from './routes/job';
// import eventRoutes from './routes/event';
const routes_1 = __importDefault(require("./routes"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const node_schedule_1 = __importDefault(require("node-schedule"));
const user_1 = require("./models/user");
console.log(process.env.MONGO_USER);
const MONGO_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PW}@cluster0.nizvwnm.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`;
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
app.use(body_parser_1.default.json());
// app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});
// app.use(authRoutes);
// app.use(jobRoutes);
// app.use(eventRoutes);
app.use(routes_1.default);
app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    const result = error.result;
    if (result) {
        res.status(status).json({ success: error.success || false, message: message, result: { ...result }, statusCode: status });
    }
    else {
        res.status(status).json({ success: error.success || false, message: message, result: result, statusCode: status });
    }
});
mongoose_1.default.connect(MONGO_URI)
    .then(result => {
    app.listen(8050, () => {
        node_schedule_1.default.scheduleJob('*/5 * * * *', () => {
            deleteOtpExpiredUser();
        });
    });
})
    .catch(err => console.log(err));
async function deleteOtpExpiredUser() {
    try {
        const result = await user_1.User.deleteMany({ otpExpired: { $lte: new Date() } });
        console.log(`${result.deletedCount} instances deleted.`);
    }
    catch (err) {
        console.error('Error deleting instances: ', err);
    }
}