import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { eventService } from '../services/event.service';

export const eventController = {
    getAllEvents: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const name = req.query.name;
            const page: number = req.query.page ? +req.query.page : 1;
            const limit: number = req.query.limit ? +req.query.limit : 10;
            const query: any = {
                isActive: true,
                deadline: { $gt: new Date() }
            };
            if (name) {
                query['name'] = name;
            };
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
    
        } catch (err) {
            if (!(err as any).statusCode) {
                (err as any).statusCode = 500;
                (err as any).result = null;
            };
            next(err);
        };
    },
    getSingleEvent: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const eventId = req.params.eventId;
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                const error: Error & { statusCode?: any, result?: any } = new Error(errors.array()[0].msg);
                error.statusCode = 400;
                error.result = null;
                throw error;
            };
            const returnEvent = await eventService.getSingleEvent(eventId);
            res.status(200).json({ success: true, message: 'Successfully!', result: returnEvent });
    
        } catch (err) {
            if (!(err as any).statusCode) {
                (err as any).statusCode = 500;
                (err as any).result = null
            };
            next(err);
        };
    }
}
