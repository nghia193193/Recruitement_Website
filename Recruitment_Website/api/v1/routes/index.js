"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_route_1 = __importDefault(require("./auth.route"));
const event_route_1 = __importDefault(require("./event.route"));
const job_route_1 = __importDefault(require("./job.route"));
const user_route_1 = __importDefault(require("./user.route"));
const routes = (0, express_1.Router)();
routes.use('/api/v1/auth', auth_route_1.default);
routes.use('/api/v1/events', event_route_1.default);
routes.use('/api/v1/jobs', job_route_1.default);
routes.use('/api/v1/user', user_route_1.default);
exports.default = routes;
