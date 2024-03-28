"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventService = void 0;
const event_1 = require("../models/event");
exports.eventService = {
    getAllEvents: async (query, page, limit) => {
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
        return { listEvents, eventLength };
    },
    getSingleEvent: async (eventId) => {
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
        return returnEvent;
    }
};
