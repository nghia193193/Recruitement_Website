import { Event } from "../models/event";

export const getAllEvents = async (query: any, page: number, limit: number) => {
    const eventLength = await Event.find(query).countDocuments();
    if (eventLength === 0) {
        const error: Error & { statusCode?: any, success?: any, result?: any } = new Error('Không tìm thấy sự kiện nào');
        error.statusCode = 200;
        error.success = true;
        error.result = {
            content: []
        };
        throw error;
    };
    const events = await Event.find(query)
        .populate('authorId')
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
    const listEvents = events.map(e => {
        const { _id, authorId, ...rest } = e;
        delete (rest as any)._doc._id;
        delete (rest as any)._doc.authorId;
        return {
            eventId: _id.toString(),
            author: (authorId as any).fullName,
            ...(rest as any)._doc
        }
    });
    return { listEvents, eventLength };
}

export const getSingleEvent = async (eventId: string) => {
    const event = await Event.findById(eventId).populate('authorId');
    if (!event) {
        const error: Error & { statusCode?: any, result?: any } = new Error('Không tìm thấy sự kiện');
        error.statusCode = 400;
        error.result = null;
        throw error;
    };
    const { _id, authorId, ...rest } = event;
    delete (rest as any)._doc._id;
    delete (rest as any)._doc.authorId;
    const returnEvent = {
        eventId: _id.toString(),
        author: (authorId as any).fullName,
        ...(rest as any)._doc,
    };
    return returnEvent;
}