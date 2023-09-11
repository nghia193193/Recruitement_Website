"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("./auth"));
const event_1 = __importDefault(require("./event"));
const job_1 = __importDefault(require("./job"));
const routes = (0, express_1.Router)();
routes.use('/api/v1', auth_1.default);
routes.use('/api/v1', event_1.default);
routes.use('/api/v1', job_1.default);
exports.default = routes;
