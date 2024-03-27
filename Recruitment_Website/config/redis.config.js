"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.client = void 0;
const redis_1 = require("redis");
exports.client = (0, redis_1.createClient)({
    url: process.env.REDIS_URI
});
exports.client.connect();
exports.client.on('error', err => console.log('Redis Client Error', err));
exports.default = exports.client;
