"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSingleEvent = exports.getAllEvents = void 0;
const express_validator_1 = require("express-validator");
const eventService = __importStar(require("../services/event.service"));
const getAllEvents = async (req, res, next) => {
    try {
        const name = req.query.name;
        const page = req.query.page ? +req.query.page : 1;
        const limit = req.query.limit ? +req.query.limit : 10;
        const query = {
            isActive: true,
            deadline: { $gt: new Date() }
        };
        if (name) {
            query['name'] = name;
        }
        ;
        const { listEvents, eventLength } = await eventService.getAllEvents(query, page, limit);
        res.status(200).json({
            success: true, message: 'Successfully!', result: {
                pageNumber: page,
                totalPages: Math.ceil(eventLength / limit),
                limit: limit,
                totalElements: eventLength,
                content: listEvents
            }
        });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        ;
        next(err);
    }
    ;
};
exports.getAllEvents = getAllEvents;
const getSingleEvent = async (req, res, next) => {
    try {
        const eventId = req.params.eventId;
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            const error = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        ;
        const returnEvent = await eventService.getSingleEvent(eventId);
        res.status(200).json({ success: true, message: 'Successfully!', result: returnEvent });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        ;
        next(err);
    }
    ;
};
exports.getSingleEvent = getSingleEvent;
