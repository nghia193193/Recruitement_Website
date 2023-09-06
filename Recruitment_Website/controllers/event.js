"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSingleEvent = exports.getAllEvents = void 0;
const event_1 = require("../models/event");
const express_validator_1 = require("express-validator");
const getAllEvents = async (req, res, next) => {
    const name = req.query.name;
    const page = req.query.page ? +req.query.page : 1;
    const limit = req.query.limit ? +req.query.limit : 10;
    try {
        const query = {};
        if (name) {
            query['name'] = name;
        }
        ;
        const eventLength = await event_1.Event.find(query).countDocuments();
        if (eventLength === 0) {
            const error = new Error('Không tìm thấy sự kiện nào');
            error.statusCode = 400;
            error.result = {
                content: []
            };
            throw error;
        }
        const events = await event_1.Event.find(query)
            .skip((page - 1) * limit)
            .limit(limit);
        const listEvents = events.map(e => {
            const { _id, ...rest } = e;
            delete rest._doc._id;
            return {
                eventId: _id.toString(),
                ...rest._doc
            };
        });
        console.log(listEvents);
        res.status(200).json({ success: true, message: 'Successfully!', result: {
                pageNumber: page,
                totalPages: Math.ceil(eventLength / limit),
                limit: limit,
                totalElements: eventLength,
                content: listEvents
            } });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        next(err);
    }
};
exports.getAllEvents = getAllEvents;
const getSingleEvent = async (req, res, next) => {
    const eventId = req.params.eventId;
    const errors = (0, express_validator_1.validationResult)(req);
    try {
        if (!errors.isEmpty()) {
            const error = new Error(errors.array()[0].msg);
            error.statusCode = 422;
            error.result = null;
            throw error;
        }
        const event = await event_1.Event.findById(eventId);
        if (!event) {
            const error = new Error('Không tìm thấy sự kiện');
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        const { _id, ...rest } = event;
        delete rest._doc._id;
        const returnEvent = {
            eventId: _id.toString(),
            ...rest._doc,
        };
        res.status(200).json({ success: true, message: 'Successfully!', result: returnEvent });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.result = null;
        }
        next(err);
    }
};
exports.getSingleEvent = getSingleEvent;
