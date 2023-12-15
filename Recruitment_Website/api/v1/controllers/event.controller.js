"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetSingleEvent = exports.GetAllEvents = void 0;
const event_1 = require("../models/event");
const express_validator_1 = require("express-validator");
const GetAllEvents = async (req, res, next) => {
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
        const eventLength = await event_1.Event.find(query).countDocuments();
        if (eventLength === 0) {
            const error = new Error('Không tìm thấy sự kiện nào');
            error.statusCode = 200;
            error.success = true;
            error.result = {
                content: []
            };
            throw error;
        }
        ;
        const events = await event_1.Event.find(query)
            .populate('authorId')
            .sort({ updatedAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);
        const listEvents = events.map(e => {
            const { _id, authorId, ...rest } = e;
            delete rest._doc._id;
            delete rest._doc.authorId;
            return {
                eventId: _id.toString(),
                author: authorId.fullName,
                ...rest._doc
            };
        });
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
exports.GetAllEvents = GetAllEvents;
const GetSingleEvent = async (req, res, next) => {
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
        const event = await event_1.Event.findById(eventId).populate('authorId');
        if (!event) {
            const error = new Error('Không tìm thấy sự kiện');
            error.statusCode = 400;
            error.result = null;
            throw error;
        }
        ;
        const { _id, authorId, ...rest } = event;
        delete rest._doc._id;
        delete rest._doc.authorId;
        const returnEvent = {
            eventId: _id.toString(),
            author: authorId.fullName,
            ...rest._doc,
        };
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
exports.GetSingleEvent = GetSingleEvent;
