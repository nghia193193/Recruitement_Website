"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventController = void 0;
const express_validator_1 = require("express-validator");
const event_service_1 = require("../services/event.service");
exports.eventController = {
    getAllEvents: async (req, res, next) => {
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
            const { listEvents, eventLength } = await event_service_1.eventService.getAllEvents(query, page, limit);
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
    },
    getSingleEvent: async (req, res, next) => {
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
            const returnEvent = await event_service_1.eventService.getSingleEvent(eventId);
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
    }
};
