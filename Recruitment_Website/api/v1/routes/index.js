"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("./auth"));
const event_1 = __importDefault(require("./event"));
const job_1 = __importDefault(require("./job"));
const user_1 = __importDefault(require("./user"));
const routes = (0, express_1.Router)();
routes.use('/api/v1/auth', auth_1.default);
routes.use('/api/v1/events', event_1.default);
routes.use('/api/v1/jobs', job_1.default);
routes.use('/api/v1/user', user_1.default);
exports.default = routes;
