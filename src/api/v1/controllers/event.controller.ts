import { NextFunction, Request, Response } from "express";
import { Event, EventInterface } from "../models/event";
import { validationResult } from "express-validator";

export const getAllEvents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const name = req.query.name;
    const page: number = req.query.page ? +req.query.page : 1; 
    const limit: number = req.query.limit ? +req.query.limit : 10;
    try {
        const query: any = {};
        if (name) {
            query['name'] = name;
        };
        
        const eventLength = await Event.find(query).countDocuments();
        if (eventLength === 0) {
            const error: Error & {statusCode?: any, result?: any} = new Error('Không tìm thấy sự kiện nào');
            error.statusCode = 422;
            error.result = {
                content: []
            };
            throw error;
        };

        const events = await Event.find(query)
            .populate('authorId')
            .skip((page - 1) * limit)
            .limit(limit);
        
        const listEvents: EventInterface[] = events.map(e => {
            const {_id, authorId, ...rest} = e;
            delete (rest as any)._doc._id;
            delete (rest as any)._doc.authorId;
            return {
                eventId: _id.toString(),
                author: (authorId as any).fullName,
                ...(rest as any)._doc
            }
        });
        
        res.status(200).json({success: true, message: 'Successfully!', result: {
            pageNumber: page,
            totalPages: Math.ceil(eventLength/limit),
            limit: limit,
            totalElements: eventLength,
            content: listEvents
        }});

    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null;
        };
        next(err);
    };
};

export const getSingleEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const eventId = req.params.eventId;
    const errors = validationResult(req);
    try {
        if (!errors.isEmpty()) {
            const error: Error & { statusCode?: any, result?: any } = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = null;
            throw error;
        };
        const event = await Event.findById(eventId).populate('authorId');
        if (!event) {
            const error: Error & {statusCode?: any, result?: any} = new Error('Không tìm thấy sự kiện');
            error.statusCode = 400;
            error.result = null;
            throw error;
        };
        const {_id, authorId, ...rest} = event;
        delete (rest as any)._doc._id;
        delete (rest as any)._doc.authorId;
        
        const returnEvent: EventInterface = {
            eventId: _id.toString(),
            author: (authorId as any).fullName,
            ...(rest as any)._doc,
        };
        res.status(200).json({success: true, message: 'Successfully!', result: returnEvent});

    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500;
            (err as any).result = null
        };
        next(err);
    };
};