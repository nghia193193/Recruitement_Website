import { Request, NextFunction, Response } from 'express';
import { Job } from '../models/job';
import { JobPosition } from '../models/jobPosition';
import { validationResult } from 'express-validator';

export const getJobs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const page: number = req.query.page ? +req.query.page : 1;
    const limit: number = req.query.limit ? +req.query.limit : 10;
    const errors = validationResult(req);
    try {
        if (!errors.isEmpty()) {
            const error: Error & { statusCode?: any, result?: any } = new Error(errors.array()[0].msg);
            error.statusCode = 400;
            error.result = {
                type: "about:blank",
                title: "Bad request",
                instance: "/api/v1/jobs"
            };
            throw error;
        }
        const query: any = {};
        const optionalQuerys: string[] = ['name', 'type', 'location'];
        for (const q of optionalQuerys) {
            if (q === 'type') {
                if (req.query[q]) {
                    query['jobType'] = req.query[q];
                }
            } else {
                if (req.query[q]) {
                    query[q] = req.query[q];
                }
            }
        };
        // console.log(query);
        if (req.query.position) {
            const jobLength = await Job.find({...query, 'position.name': req.query.position}).countDocuments();
            const jobs = await Job.find({...query, 'position.name': req.query.position})
                .skip((page - 1) * limit)
                .limit(limit);
            const listjobs = jobs.map(job => {
                const { _id: jobId, ...rest} = job;
                const { _id, skills, position, ...r} = (rest as any)._doc;
                position.positionId = position.positionId.toString();
                const listSkills = skills.map((skill: { _id: any; name: any; }) => {
                    const { _id, name} = skill;
                    return {
                        skillId: _id.toString(),
                        name: name
                    }
                })
                return {
                    jobId: jobId.toString(),
                    skills: listSkills,
                    position,
                    ...r
                }
            });
            console.log(listjobs)
            res.status(200).json({success: true, message: 'Successfully', statusCode: 200, result: {
                pageNumber: page,
                totalPages: Math.ceil(jobLength/limit),
                limit: limit,
                totalElements: jobLength,
                content: listjobs
            }});
        } else {
            const jobLength = await Job.find(query).countDocuments();
            const jobs = await Job.find(query)
                .skip((page - 1) * limit)
                .limit(limit);
            const listjobs = jobs.map(job => {
                const { _id: jobId, ...rest} = job;
                const { _id, skills, position, ...r} = (rest as any)._doc;
                position.positionId = position.positionId.toString();
                const listSkills = skills.map((skill: { _id: any; name: any; }) => {
                    const { _id, name} = skill;
                    return {
                        skillId: _id.toString(),
                        name: name
                    }
                })
                return {
                    jobId: jobId.toString(),
                    skills: listSkills,
                    position,
                    ...r
                }
            });
            console.log(listjobs);
            res.status(200).json({success: true, message: 'Successfully', statusCode: 200, result: {
                pageNumber: page,
                totalPages: Math.ceil(jobLength/limit),
                limit: limit,
                totalElements: jobLength,
                content: listjobs
            }});
        }
    } catch (err) {
        if (!(err as any).statusCode) {
            (err as any).statusCode = 500
        }
        next(err);
    }
};